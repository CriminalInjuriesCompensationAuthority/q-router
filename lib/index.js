'use strict';

// const semverLte = require('semver/functions/lte');
// const qRouter = require('./router');
const createHelper = require('./extendedStateHelper');

// Set to the first version of the template which implements parallel states
// const toggleVersion = '12.1.1';

function createSuperRouter(spec) {
    // if routes.states is an object, then use qRouter
    // iff routes.states is an array, then fall through.

    // // Backwards compatibility
    // // if the version is earlier than the toggle
    // if (semverLte(spec.version, toggleVersion)) {
    //     // Run the spec thru the qRouter and return
    //     return qRouter(spec);
    // }

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
