'use strict';

const qExpression = require('q-expressions');
const semverLte = require('semver/functions/lte');
const qRouter = require('./router');

const toggleVersion = '2.0.0';

function superRouter(spec) {
    // Backwards compatibility
    if (semverLte(spec.version, toggleVersion)) {
        return qRouter(spec);
    }

    const superRouterSpec = {...spec};

    // Process spec && create machines
    const taskMachines = {};
    const tasks = Object.keys(superRouterSpec.routes.states);
    const initialStatuses = {};
    tasks.forEach(task => {
        // Setup parallel specs
        const taskSpec = {...superRouterSpec};
        taskSpec.id = task;
        taskSpec.routes = superRouterSpec.routes.states[task];
        // set initial statuses
        taskSpec.status = 'incomplete';
        initialStatuses[task] = 'incomplete';

        // set initial value and initial progress
        taskSpec.initial = superRouterSpec.routes.states[task].initial;
        taskSpec.progress = [Object.keys(superRouterSpec.routes.states[task].states)[0]];

        // Create machines
        taskMachines[task] = qRouter(taskSpec);
    });

    superRouterSpec.initial = superRouterSpec.initial || tasks[0];
    superRouterSpec.routes = taskMachines;
    superRouterSpec.taskStatuses = initialStatuses;
    superRouterSpec.currentSectionId = superRouterSpec.routes[superRouterSpec.initial].first().id;
    superRouterSpec.events = [];

    function getTaskIdFromQuestionId(currentSectionId) {
        let targetTask = '';
        tasks.forEach(task => {
            if (currentSectionId in spec.routes.states[task].states) {
                targetTask = task;
            }
        });
        if (!targetTask) {
            throw new Error(`The state "${currentSectionId}" does not exist`);
        }
        return targetTask;
    }

    function getTaskContext(taskId) {
        return superRouterSpec.routes[taskId].last().context;
    }

    function getNotApplicableTasks() {
        const possibleTasks = spec.routes.on['NEXT-TASK'];
        const invalidTasks = [];
        possibleTasks.forEach(task => {
            if (task.cond) {
                if (!qExpression.evaluate(task.cond, superRouterSpec)) {
                    invalidTasks.push(task.target);
                }
            }
        });
        return invalidTasks;
    }

    function updateSuperContext() {
        let allAnswers = {};
        const allStatuses = {};
        let allProgress = [];
        let allEvents = [];
        const notApplicableTasks = getNotApplicableTasks();
        tasks.forEach(task => {
            if (notApplicableTasks.includes(task)) {
                allStatuses[task] = 'notApplicable';
            } else {
                allAnswers = {
                    ...allAnswers,
                    ...superRouterSpec.routes[task].last().context.answers
                };
                allProgress = [
                    ...allProgress,
                    ...superRouterSpec.routes[task].last().context.progress
                ];
                allStatuses[task] = superRouterSpec.routes[task].last().context.status;
                allEvents = [...allEvents, ...superRouterSpec.routes[task].last().context.events];
            }
        });
        superRouterSpec.answers = allAnswers;
        superRouterSpec.progress = allProgress;
        superRouterSpec.taskStatuses = allStatuses;
        superRouterSpec.events = allEvents;
    }

    function isAvailable(id) {
        if (id === 'p-task-list') {
            return true;
        }
        if (id in superRouterSpec.routes) {
            // is a task
            const targetContext = getTaskContext(id);
            return ['complete', 'incomplete'].includes(targetContext.status);
        }
        const task = getTaskIdFromQuestionId(id);
        const targetContext = getTaskContext(task);
        return targetContext.progress.includes(id);
    }

    function getPreviousQuestionId(sectionId) {
        const task = getTaskIdFromQuestionId(sectionId);
        const targetContext = getTaskContext(task);
        const currentIndex = targetContext.progress.indexOf(sectionId);

        // If we're on the first element, there are no previous sections, go to the task list
        // ToDo: If question is the first page on the first task, go to referrer(???)
        if (currentIndex === 0) {
            return 'p-task-list';
        }

        return targetContext.progress[currentIndex - 1];
    }

    function propagateCascade(event) {
        Object.keys(superRouterSpec.routes).forEach(task => {
            if (task !== event.origin) {
                const questions = spec.routes.states[task].states;
                Object.keys(questions).forEach(question => {
                    const possibleTargets = questions[question].on.ANSWER;
                    const isAffected = possibleTargets.some(target => {
                        if ('cond' in target) {
                            return target.cond.some(element =>
                                String(element).includes(`.${event.value}.`)
                            );
                        }
                        return false;
                    });
                    if (isAffected) {
                        superRouterSpec.routes[task].externalCascade(question);
                    }
                });
            }
        });
        // remove event from child machine
        return superRouterSpec.routes[event.origin].clearCascadeEvent(event);
    }

    function setCurrent(currentSectionId) {
        if (!isAvailable(currentSectionId)) {
            throw new Error(`The state "${currentSectionId}" is not available`);
        }

        updateSuperContext();

        if (currentSectionId in superRouterSpec.routes) {
            // is a task
            superRouterSpec.currentSectionId = superRouterSpec.routes[currentSectionId].first().id;
            return {
                id: superRouterSpec.currentSectionId,
                context: superRouterSpec
            };
        }

        if (currentSectionId === 'p-task-list') {
            superRouterSpec.currentSectionId = 'p-task-list';
            // Do something with events
            const cascadeEvents = superRouterSpec.events.filter(event => event.type === 'cascade');
            cascadeEvents.forEach(event => {
                propagateCascade(event);
            });
            // remove processed events
            superRouterSpec.events = superRouterSpec.events.filter(
                event => !cascadeEvents.includes(event)
            );

            // Update context again to check for effect of cascades
            updateSuperContext();

            return {
                id: 'p-task-list',
                context: superRouterSpec
            };
        }
        if (currentSectionId && currentSectionId !== superRouterSpec.currentSectionId) {
            if (!isAvailable(currentSectionId)) {
                return undefined;
            }

            superRouterSpec.currentSectionId = currentSectionId;
        }

        return {
            id: superRouterSpec.currentSectionId,
            context: superRouterSpec
        };
    }

    function current(currentSectionId) {
        const currentSection = setCurrent(currentSectionId);

        // return a currentSection clone to avoid leaking internal state
        return currentSection ? JSON.parse(JSON.stringify(currentSection)) : currentSection;
    }

    function next(answers, currentSectionId = superRouterSpec.currentSectionId, event = 'ANSWER') {
        const task = getTaskIdFromQuestionId(currentSectionId);

        const nextState = superRouterSpec.routes[task].next2(answers, currentSectionId, event, {
            ...superRouterSpec.answers
        });
        return setCurrent(nextState.id);
    }

    function previous(currentSectionId = superRouterSpec.currentSectionId) {
        if (!isAvailable(currentSectionId)) {
            return undefined;
        }

        const previousId = getPreviousQuestionId(currentSectionId);

        // Return the value before the current index
        return setCurrent(previousId);
    }

    function first() {
        const task = superRouterSpec.initial;
        return setCurrent(superRouterSpec.routes[task].first().id);
    }

    function last() {
        return setCurrent(superRouterSpec.currentSectionId);
    }

    function nextTask(taskId) {
        if (superRouterSpec.taskStatuses[taskId] === 'notApplicable') {
            throw new Error(`Task "${taskId}" is not applicable.`);
        }
        return setCurrent(taskId);
    }

    // ToDo:
    // 1. Cascade events

    return Object.freeze({
        current,
        next,
        previous,
        available: isAvailable,
        first,
        last,
        nextTask
    });
}

module.exports = superRouter;
