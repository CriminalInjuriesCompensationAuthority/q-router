const createMachine = require('./extendedFiniteStateMachine');
const deepEqual = require('./deepEqual');

function qRouter(spec) {
    const q = Object.assign({}, spec);
    const fsm = createMachine(q.routes);
    q.answers = q.answers || {};
    q.progress = q.progress || [fsm.initialState.value];
    const currentSection = {
        id: q.progress[q.progress.length - 1],
        context: q
    };

    function isSectionAvailable(sectionId) {
        return q.progress.includes(sectionId);
    }

    function isSectionFinal(sectionId) {
        return 'type' in q.routes.states[sectionId] && q.routes.states[sectionId].type === 'final';
    }

    function findCascadeIndex(sectionId) {
        const startIndex = q.progress.indexOf(sectionId);

        for (let i = startIndex, sectionRoutes; i < q.progress.length; i += 1) {
            // Route formats:
            // { on: { ANSWER: 'c' } }
            // { on: { ANSWER: [ [Object], [Object], ... ] } }
            // { type: 'final' }
            sectionRoutes = q.routes.states[q.progress[i]];

            // If there is an "on" attribute there may be conditions
            if ('on' in sectionRoutes) {
                const targets = sectionRoutes.on.ANSWER;

                // If the target is an array it might contain conditions
                if (Array.isArray(targets)) {
                    const cascade = targets.some(target => {
                        if ('cond' in target) {
                            // Do any of the conditions reference the sectionId
                            return target.cond.some(element =>
                                String(element).includes(`.${sectionId}.`)
                            );
                        }

                        return false;
                    });

                    if (cascade) {
                        // If startIndex and i are equal, this is a section that relies on its own answer(s)
                        // for routing. Don't remove it from the progress, but everything after it (i + 1).
                        return startIndex === i ? i + 1 : i;
                    }
                }
            }
        }

        return -1;
    }

    function setProgress(sectionId) {
        currentSection.id = sectionId;

        // If this section hasn't already been visited, add it to the progress
        if (!q.progress.includes(sectionId)) {
            q.progress.push(sectionId);
        }

        return currentSection;
    }

    // get/set
    function current(currentSectionId) {
        if (currentSectionId && currentSectionId !== currentSection.id) {
            if (!isSectionAvailable(currentSectionId)) {
                return undefined;
            }

            currentSection.id = currentSectionId;
        }

        return currentSection;
    }

    function next(answers, currentSectionId = currentSection.id, event = 'ANSWER') {
        if (!isSectionAvailable(currentSectionId)) {
            return undefined;
        }

        if (isSectionFinal(currentSectionId)) {
            throw Error(`There are no next sections after section: "${currentSectionId}"`);
        }

        if (answers !== undefined) {
            // If there is no current answer save the answer
            if (q.answers[currentSectionId] === undefined) {
                q.answers[currentSectionId] = answers;
            } else {
                const sameAnswer = deepEqual(answers, q.answers[currentSectionId]);

                // If the answer(s) are different from those currently stored, there may be a cascade
                if (!sameAnswer) {
                    // Add new answer(s)
                    q.answers[currentSectionId] = answers;

                    const cascadeIndex = findCascadeIndex(currentSectionId);

                    // Remove all progress after the cascade index
                    if (cascadeIndex > -1) {
                        q.progress.length = cascadeIndex;
                    }
                }
            }
        }

        const state = fsm.transition({value: currentSectionId}, event, q);

        return setProgress(state.value);
    }

    function previous(currentSectionId = currentSection.id) {
        if (!isSectionAvailable(currentSectionId)) {
            return undefined;
        }

        // Find the index of the current position
        const currentIndex = q.progress.indexOf(currentSectionId);

        // If we're on the first element, there are no previous sections
        if (currentIndex === 0) {
            throw Error(`There are no previous sections before section: "${currentSectionId}"`);
        }

        // Get the value before the current index
        currentSection.id = q.progress[currentIndex - 1];

        return currentSection;
    }

    return Object.freeze({
        current,
        next,
        previous,
        available: isSectionAvailable
    });
}

module.exports = qRouter;
