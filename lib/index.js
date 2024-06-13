'use strict';

const qRouter = require('./router');
const createHelper = require('./extendedStateHelper');

function createSuperRouter(spec) {
    // Backwards compatibility
    // if states is not an array, it's a single task template
    if (!Array.isArray(spec.routes.states)) {
        return qRouter(spec);
    }

    const extendedStateHelper = createHelper(spec);

    function current(currentSectionId) {
        const currentSection = extendedStateHelper.setCurrent(currentSectionId);

        // return a currentSection clone to avoid leaking internal state
        return currentSection ? JSON.parse(JSON.stringify(currentSection)) : currentSection;
    }

    function previous(currentSectionId) {
        // get previous question's Id
        const previousId = extendedStateHelper.getPreviousQuestionId(currentSectionId);

        // Set the previous question to be the current state
        return extendedStateHelper.setCurrent(previousId);
    }

    return Object.freeze({
        current,
        next: extendedStateHelper.next,
        previous,
        available: extendedStateHelper.isAvailable,
        first: extendedStateHelper.first,
        last: extendedStateHelper.setCurrent
    });
}

module.exports = createSuperRouter;
