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

    function setCurrent(currentId) {
        if (currentId && currentId !== superRouterSpec.currentSectionId) {
            superRouterSpec.currentSectionId = currentId;
        }

        // Check for and handle any cascade events
        extendedStateHelper.handleCascadeEvents(superRouterSpec, taskMachines);

        // swap back to spec.routes.states to prevent exposing the machines and allow rehydration.
        superRouterSpec.routes = extendedStateHelper.persistContext(superRouterSpec, taskMachines);

        // Get shared progress
        superRouterSpec.progress = extendedStateHelper.getSharedProgress(
            superRouterSpec,
            taskMachines
        );

        // Get shared statuses
        superRouterSpec.taskStatuses = extendedStateHelper.getSharedStatuses(
            superRouterSpec,
            taskMachines
        );

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
        // get all answers
        const allAnswers = extendedStateHelper.getSharedAnswers(superRouterSpec, taskMachines);
        // Add current answers
        allAnswers[currentSectionId] = {...answers};

        // Pass the super router context, this is the only way parallel machines can evaluate their routes correctly.
        const nextState = taskMachines[task].next2(answers, currentSectionId, event, {
            answers: allAnswers,
            attributes: superRouterSpec.attributes
        });
        return setCurrent(nextState.id);
    }

    function previous(currentSectionId = superRouterSpec.currentSectionId) {
        // get previous question's Id
        const previousId = extendedStateHelper.getPreviousQuestionId(
            superRouterSpec,
            currentSectionId,
            taskMachines
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
