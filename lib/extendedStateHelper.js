'use strict';

const qExpression = require('q-expressions');
const qRouter = require('./router');

function createExtendedState(spec) {
    function setupParallelMachines() {
        // Use `spec` for looking up static information only, such as searching the routes
        // Use `superRouterSpec` for machine actions
        const superSpec = structuredClone(spec);
        // Process spec && create machines
        const taskMachines = {};
        const tasks = superSpec.routes.states;
        tasks.forEach(task => {
            // Setup parallel specs
            const taskSpec = structuredClone(superSpec);
            taskSpec.id = task.id;
            taskSpec.routes = task;
            taskSpec.answers = task.answers ? task.answers : {};
            taskSpec.progress = task.progress ? task.progress : [task.initial];
            taskSpec.status = task.status ? task.status : 'incomplete';
            taskSpec.events = task.events ? task.events : [];

            // Create machines
            taskMachines[task.id] = qRouter(taskSpec);
        });

        // Setup super router context & routes
        superSpec.initial = superSpec.initial || tasks[0].id;
        superSpec.currentSectionId = superSpec.currentSectionId || tasks[0].initial;
        return {superRouterSpec: superSpec, taskMachines};
    }

    const {superRouterSpec, taskMachines} = setupParallelMachines();

    function getTaskIdFromQuestionId(currentSectionId) {
        let targetTask = '';
        spec.routes.states.forEach(task => {
            if (currentSectionId in task.states) {
                targetTask = task.id;
            }
        });
        if (!targetTask) {
            throw new Error(`The state "${currentSectionId}" does not exist`);
        }
        return targetTask;
    }

    function getTaskContext(taskId) {
        if (!taskId || !superRouterSpec.routes.states.some(task => task.id === taskId)) {
            throw new Error(`The task "${taskId}" does not exist`);
        }

        return taskMachines[taskId].last().context;
    }

    function getNotApplicableTasks() {
        // Check the routing rules for the task list.
        const possibleTasks = spec.routes.guards;
        const invalidTasks = [];
        if (possibleTasks) {
            Object.keys(possibleTasks).forEach(task => {
                if (!qExpression.evaluate(possibleTasks[task].cond, superRouterSpec)) {
                    // The task is unavailable, based on the answers given
                    invalidTasks.push(task);
                }
            });
        }
        return invalidTasks;
    }

    function isAvailable(id) {
        // If the task or question is unavailable
        if (!id) {
            return false;
        }
        //  The task list is always available
        if (id === 'p-task-list') {
            return true;
        }
        // Else, is a question. Check the progress entries
        const task = getTaskIdFromQuestionId(id);
        if (superRouterSpec.taskStatuses[task] === 'notApplicable') {
            return false;
        }
        const targetContext = getTaskContext(task);
        return targetContext.progress.includes(id);
    }

    function getPreviousQuestionId(sectionId = superRouterSpec.currentSectionId) {
        const task = getTaskIdFromQuestionId(sectionId);
        const targetContext = getTaskContext(task);

        if (!targetContext.routes.progress) {
            throw new Error(`The task "${task}" has a malformed context. Missing: "Progress"`);
        }

        const currentIndex = targetContext.routes.progress.indexOf(sectionId);

        if (currentIndex === -1) {
            throw new Error(`Cannot go back to "${sectionId}"`);
        }

        // If we're on the first element, there are no previous sections, go to the task list
        // ToDo: If question is the first page on the first task, go to referrer(???)
        if (currentIndex === 0) {
            return 'p-task-list';
        }

        return targetContext.routes.progress[currentIndex - 1];
    }

    function propagateCascade(event) {
        Object.keys(taskMachines).forEach(task => {
            // Ignore the task from which the cascade originated
            if (task !== event.origin) {
                taskMachines[task].externalCascade(event.value);
            }
        });
        // remove event from child machine so the parent machine doesn't replay this cascade
        return taskMachines[event.origin].clearCascadeEvent(event);
    }

    function persistContext() {
        const {routes} = superRouterSpec;
        // Persist the progress and status of each machine
        routes.states.forEach(task => {
            const currentTask = task;
            currentTask.progress = [...taskMachines[currentTask.id].last().context.progress];
            currentTask.status = taskMachines[currentTask.id].last().context.routes.status;
            currentTask.answers = taskMachines[currentTask.id].last().context.routes.answers;
            currentTask.events = taskMachines[currentTask.id].last().context.routes.events;
        });
        return routes;
    }

    function getSharedProgress() {
        const notApplicable = getNotApplicableTasks();
        const sharedProgress = [];
        Object.keys(taskMachines).forEach(task => {
            if (!notApplicable.includes(task)) {
                sharedProgress.push(...taskMachines[task].last().context.progress);
            }
        });
        return sharedProgress;
    }

    function getSharedAnswers() {
        const notApplicable = getNotApplicableTasks();
        let sharedAnswers = {};
        Object.keys(taskMachines).forEach(task => {
            if (!notApplicable.includes(task)) {
                sharedAnswers = {
                    ...sharedAnswers,
                    ...taskMachines[task].last().context.answers
                };
            }
        });
        return sharedAnswers;
    }

    function getSharedEvents() {
        const notApplicable = getNotApplicableTasks();
        const sharedEvents = [];
        Object.keys(taskMachines).forEach(task => {
            if (!notApplicable.includes(task)) {
                sharedEvents.push(...taskMachines[task].last().context.events);
            }
        });
        return sharedEvents;
    }

    function getSharedStatuses() {
        const notApplicable = getNotApplicableTasks();
        const sharedStatuses = {};
        Object.keys(taskMachines).forEach(task => {
            if (!notApplicable.includes(task)) {
                sharedStatuses[task] = taskMachines[task].last().context.status;
            }
        });
        return sharedStatuses;
    }

    function handleCascadeEvents() {
        const events = getSharedEvents();
        const cascadeEvents = events.filter(event => event.type === 'cascade');
        cascadeEvents.forEach(event => {
            propagateCascade(event);
        });
    }

    function setCurrent(currentId) {
        if (currentId && currentId !== superRouterSpec.currentSectionId) {
            superRouterSpec.currentSectionId = currentId;
        }

        // Check for and handle any cascade events
        handleCascadeEvents();

        // swap back to spec.routes.states to prevent exposing the machines and allow rehydration.
        superRouterSpec.routes = persistContext();

        // Get shared progress
        superRouterSpec.progress = getSharedProgress();

        // Get shared statuses
        superRouterSpec.taskStatuses = getSharedStatuses();

        // Get shared Answers
        superRouterSpec.answers = getSharedAnswers();

        return {
            id: superRouterSpec.currentSectionId,
            context: superRouterSpec
        };
    }

    function first() {
        // Go to the parent machines initial state
        const task = superRouterSpec.initial;
        return setCurrent(taskMachines[task].first().id);
    }

    function next(answers, currentSectionId, event = 'ANSWER') {
        if (!isAvailable(currentSectionId)) {
            throw new Error(`The state "${currentSectionId}" is not available`);
        }
        const task = getTaskIdFromQuestionId(currentSectionId);
        // get all answers
        const allAnswers = getSharedAnswers();
        // Add current answers
        allAnswers[currentSectionId] = {...answers};

        // Pass the super router context, this is the only way parallel machines can evaluate their routes correctly.
        const nextState = taskMachines[task].next2(answers, currentSectionId, event, {
            answers: allAnswers,
            attributes: superRouterSpec.attributes
        });
        return setCurrent(nextState.id);
    }

    return Object.freeze({
        setupParallelMachines,
        getTaskIdFromQuestionId,
        getTaskContext,
        getNotApplicableTasks,
        isAvailable,
        getPreviousQuestionId,
        propagateCascade,
        persistContext,
        getSharedProgress,
        getSharedAnswers,
        getSharedEvents,
        getSharedStatuses,
        handleCascadeEvents,
        setCurrent,
        first,
        next
    });
}

module.exports = createExtendedState;
