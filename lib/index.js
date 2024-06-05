'use strict';

const semverLte = require('semver/functions/lte');
const qRouter = require('./router');
const createHelper = require('./extendedStateHelper');

// Set to the first version of the template which implements parallel states
const toggleVersion = '12.1.1';

function superRouter(spec) {
    // Backwards compatibility
    // if the version is earlier than the toggle
    if (semverLte(spec.version, toggleVersion)) {
        // Run the spec thru the qRouter and return
        return qRouter(spec);
    }

    const extendedStateHelper = createHelper(spec);
    // Use `spec` for looking up static information only, such as searching the routes
    // Use `superRouterSpec` for machine actions
    const {superRouterSpec, taskMachines} = extendedStateHelper.setupParallelMachines(spec);

    function updateSuperContext() {
        // initialise empty objects
        const allStatuses = {};
        let allEvents = [];
        // Handle `notApplicable` tasks
        const notApplicableTasks = extendedStateHelper.getNotApplicableTasks(superRouterSpec);
        Object.keys(taskMachines).forEach(task => {
            if (notApplicableTasks.includes(task)) {
                // Set the status and don't collect the machines context
                allStatuses[task] = 'notApplicable';
            } else {
                // Merge the machines context to build the super routers context
                allStatuses[task] = taskMachines[task].last().context.status;
                allEvents = [...allEvents, ...taskMachines[task].last().context.events];
            }
        });
        // Update the super routers context
        superRouterSpec.taskStatuses = allStatuses;
        superRouterSpec.events = allEvents;
    }

    updateSuperContext();

    function setCurrent(currentId) {
        // If the task or question is unavailable
        if (!extendedStateHelper.isAvailable(superRouterSpec, currentId, taskMachines)) {
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
                extendedStateHelper.propagateCascade(taskMachines, event);
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

        // swap back to spec.routes.states to prevent exposing the machines and allow rehydration.
        superRouterSpec.routes = extendedStateHelper.persistContext(superRouterSpec, taskMachines);

        // Get shared progress
        superRouterSpec.progress = extendedStateHelper.getSharedProgress(taskMachines);

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
        if (!extendedStateHelper.isAvailable(superRouterSpec, currentSectionId, taskMachines)) {
            throw new Error(`The state "${currentSectionId}" is not available`);
        }
        const task = extendedStateHelper.getTaskIdFromQuestionId(currentSectionId);

        // Pass the super router context, this is the only way parallel machines can evaluate their routes correctly.
        const nextState = taskMachines[task].next2(answers, currentSectionId, event, {
            ...superRouterSpec.answers
        });
        return setCurrent(nextState.id);
    }

    function previous(currentSectionId = superRouterSpec.currentSectionId) {
        // get previous question's Id
        const previousId = extendedStateHelper.getPreviousQuestionId(
            superRouterSpec,
            currentSectionId
        );

        // Set the previous question to be the current state
        return setCurrent(previousId);
    }

    function available(id) {
        return extendedStateHelper.isAvailable(superRouterSpec, id, taskMachines);
    }

    function first() {
        // Go to the parent machines initial state
        const task = superRouterSpec.initial;
        return setCurrent(taskMachines[task].first().id);
    }

    function last() {
        // Return the most recently viewed question
        return setCurrent(superRouterSpec.currentSectionId);
    }

    return Object.freeze({
        current,
        next,
        previous,
        available,
        first,
        last
    });
}

module.exports = superRouter;
