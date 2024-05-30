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
        const tasks = Object.keys(superSpec.routes.states);
        const initialStatuses = {};
        tasks.forEach(task => {
            // Setup parallel specs
            const taskSpec = structuredClone(superSpec);
            taskSpec.id = task;
            taskSpec.routes = superSpec.routes.states[task];
            // set initial statuses
            taskSpec.status = 'incomplete';
            initialStatuses[task] = 'incomplete';

            // set initial progress
            taskSpec.progress = [superSpec.routes.states[task].initial];

            // Create machines
            taskMachines[task] = qRouter(taskSpec);
        });

        // Setup super router context & routes
        superSpec.initial = superSpec.initial || tasks[0];
        superSpec.routes.states = taskMachines;
        superSpec.taskStatuses = initialStatuses;
        superSpec.currentSectionId = superSpec.routes.states[superSpec.initial].first().id;
        superSpec.events = [];
        return superSpec;
    }

    function getTaskIdFromQuestionId(currentSectionId) {
        const tasks = Object.keys(spec.routes.states);
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

    function getTaskContext(superRouterSpec, taskId) {
        if (!taskId || !Object.keys(superRouterSpec.routes.states).includes(taskId)) {
            throw new Error(`The task "${taskId}" does not exist`);
        }

        return superRouterSpec.routes.states[taskId].last().context;
    }

    function getNotApplicableTasks(superRouterSpec) {
        // Check the routing rules for the task list.
        const possibleTasks = spec.routes.guards;
        const invalidTasks = [];
        Object.keys(possibleTasks).forEach(task => {
            if (!qExpression.evaluate(possibleTasks[task].cond, superRouterSpec)) {
                // The task is unavailable, based on the answers given
                invalidTasks.push(task);
            }
        });
        return invalidTasks;
    }

    function isAvailable(superRouterSpec, id) {
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
        const targetContext = getTaskContext(superRouterSpec, task);
        return targetContext.progress.includes(id);
    }

    function getPreviousQuestionId(superRouterSpec, sectionId) {
        const task = getTaskIdFromQuestionId(sectionId);
        const targetContext = getTaskContext(superRouterSpec, task);

        if (!targetContext.progress) {
            throw new Error(`The task "${task}" has a malformed context. Missing: "Progress"`);
        }

        const currentIndex = targetContext.progress.indexOf(sectionId);

        if (currentIndex === -1) {
            throw new Error(`Cannot go back to "${sectionId}"`);
        }

        // If we're on the first element, there are no previous sections, go to the task list
        // ToDo: If question is the first page on the first task, go to referrer(???)
        if (currentIndex === 0) {
            return 'p-task-list';
        }

        return targetContext.progress[currentIndex - 1];
    }

    function propagateCascade(superRouterSpec, event) {
        Object.keys(superRouterSpec.routes.states).forEach(task => {
            // Ignore the task from which the cascade originated
            if (task !== event.origin) {
                superRouterSpec.routes.states[task].externalCascade(event.value);
            }
        });
        // remove event from child machine so the parent machine doesn't replay this cascade
        return superRouterSpec.routes.states[event.origin].clearCascadeEvent(event);
    }

    return Object.freeze({
        setupParallelMachines,
        getTaskIdFromQuestionId,
        getTaskContext,
        getNotApplicableTasks,
        isAvailable,
        getPreviousQuestionId,
        propagateCascade
    });
}

module.exports = createExtendedState;
