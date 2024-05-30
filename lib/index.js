'use strict';

const qExpression = require('q-expressions');
const semverLte = require('semver/functions/lte');
const qRouter = require('./router');

// Set to the first version of the template which implements parallel states
const toggleVersion = '2.0.0';

function superRouter(spec) {
    // Backwards compatibility
    // if the version is earlier than the toggle
    if (semverLte(spec.version, toggleVersion)) {
        // Run the spec thru the qRouter and return
        return qRouter(spec);
    }

    // Use `spec` for looking up static information only, such as searching the routes
    // Use `superRouterSpec` for machine actions
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

        // set initial progress
        taskSpec.progress = [superRouterSpec.routes.states[task].initial];

        // Create machines
        taskMachines[task] = qRouter(taskSpec);
    });

    // Setup super router context & routes
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
        // Check the routing rules for the task list.
        const possibleTasks = spec.routes.guards;
        const invalidTasks = [];
        Object.keys(possibleTasks).forEach(task => {
            if (possibleTasks[task].cond) {
                // If the task routing rule does not evaluate to true
                if (!qExpression.evaluate(possibleTasks[task].cond, superRouterSpec)) {
                    // The task is unavailable, based on the answers given
                    invalidTasks.push(task);
                }
            }
        });
        return invalidTasks;
    }

    function updateSuperContext() {
        // initialise empty objects
        let allAnswers = {};
        const allStatuses = {};
        let allProgress = [];
        let allEvents = [];
        // Handle `notApplicable` tasks
        const notApplicableTasks = getNotApplicableTasks();
        tasks.forEach(task => {
            if (notApplicableTasks.includes(task)) {
                // Set the status and don't collect the machines context
                allStatuses[task] = 'notApplicable';
            } else {
                // Merge the machines context to build the super routers context
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
        // Update the super routers context
        superRouterSpec.answers = allAnswers;
        superRouterSpec.progress = allProgress;
        superRouterSpec.taskStatuses = allStatuses;
        superRouterSpec.events = allEvents;
    }

    function isAvailable(id) {
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
            // Ignore the task from which the cascade originated
            if (task !== event.origin) {
                superRouterSpec.routes[task].externalCascade(event.value);
            }
        });
        // remove event from child machine so the parent machine doesn't search for this cascade again
        return superRouterSpec.routes[event.origin].clearCascadeEvent(event);
    }

    function setCurrent(currentId) {
        // If the task or question is unavailable
        if (!isAvailable(currentId)) {
            throw new Error(`The state "${currentId}" is not available`);
        }

        // Refresh the super router's context
        updateSuperContext();

        // If the Id is the task list
        if (currentId === 'p-task-list') {
            // Set the current Id
            superRouterSpec.currentSectionId = 'p-task-list';
            // Check for and handle any cascade events
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

        // If `currentId` is different, update the super router
        if (currentId && currentId !== superRouterSpec.currentSectionId) {
            superRouterSpec.currentSectionId = currentId;
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

        // Update super context to make sure the latest answers are available
        updateSuperContext();

        // Pass the super router context, this is the only way parallel machines can evaluate their routes correctly.
        const nextState = superRouterSpec.routes[task].next2(answers, currentSectionId, event, {
            ...superRouterSpec.answers
        });
        return setCurrent(nextState.id);
    }

    function previous(currentSectionId = superRouterSpec.currentSectionId) {
        // get previous question's Id
        const previousId = getPreviousQuestionId(currentSectionId);

        // Set the previous question to be the current state
        return setCurrent(previousId);
    }

    function first() {
        // Go to the parent machines initial state
        const task = superRouterSpec.initial;
        return setCurrent(superRouterSpec.routes[task].first().id);
    }

    function last() {
        // Return the most recently viewed question
        return setCurrent(superRouterSpec.currentSectionId);
    }

    return Object.freeze({
        current,
        next,
        previous,
        available: isAvailable,
        first,
        last
    });
}

module.exports = superRouter;
