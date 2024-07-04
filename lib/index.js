'use strict';

const createMachine = require('./extendedFiniteStateMachine');
const deepEqual = require('./deepEqual');

function qRouter(spec, fireEventAtAllMachines) {
    const q = {...spec};
    const fsm = createMachine(q.routes);
    const roles = q.attributes?.q__roles;
    q.answers = q.answers || {};
    q.retractedAnswers = q.retractedAnswers || {};
    q.progress = q.progress || [fsm.initialState.value];
    q.currentSectionId = q.currentSectionId || q.progress[q.progress.length - 1];

    // enable feature toggling.
    q.answers.system = {
        ...q.answers.system,
        env: process.env.APP_ENV
    };

    function isSectionAvailable(sectionId) {
        return q.progress.includes(sectionId);
    }

    function isSectionFinal(sectionId) {
        return 'type' in q.routes.states[sectionId] && q.routes.states[sectionId].type === 'final';
    }

    function isUsingRoleRouting(target) {
        return target.cond.some(element => String(element).includes('|role'));
    }

    function isPageAndQuestion(target) {
        return target.includes('$.answers');
    }

    function hasRoleRoutingMatch(target, sectionId) {
        const userRoles = target;
        let hasMatch = false;
        for (let userRole = 1; userRole < userRoles.length; userRole += 1) {
            if (Array.isArray(userRoles[userRole])) {
                hasMatch = hasRoleRoutingMatch(userRoles[userRole], sectionId);
            } else {
                const roleKey = userRoles[userRole];
                if (isPageAndQuestion(roleKey)) {
                    hasMatch = roleKey.includes(sectionId);
                    userRole = userRoles.length;
                } else {
                    hasMatch = roles[roleKey].schema.const.some(element =>
                        String(element).includes(`.${sectionId}.`)
                    );
                }
            }
            if (hasMatch) {
                break;
            }
        }
        return hasMatch;
    }

    function findCascadeIndex(sectionId) {
        // const startIndex = 0;
        const startIndex = q.progress.indexOf(sectionId);
        for (let i = startIndex, sectionRoutes; i < q.progress.length; i += 1) {
            // Route formats:
            // { on: { ANSWER: 'c' } }
            // { on: { ANSWER: [ [Object], [Object], ... ] } }
            // { type: 'final' }
            sectionRoutes = q.routes.states[q.progress[i]];

            // If there is an "on" attribute there may be conditions
            if ('on' in sectionRoutes) {
                const targets =
                    sectionRoutes.on[`ANSWER__${sectionId.toUpperCase()}`] ||
                    sectionRoutes.on.ANSWER;

                // If the target is an array it might contain conditions
                if (Array.isArray(targets)) {
                    const cascade = targets.some(target => {
                        if ('cond' in target) {
                            // Do any of the conditions reference the sectionId
                            if (isUsingRoleRouting(target)) {
                                return hasRoleRoutingMatch(target.cond, sectionId);
                            }
                            return target.cond.some(element =>
                                String(element).includes(`.${sectionId}.`)
                            );
                        }
                        return false;
                    });

                    if (cascade) {
                        // If startIndex and i are equal, this is a section that relies on its own answer(s)
                        // for routing. Don't remove it from the progress, but everything after it (i + 1).
                        // return i + 1;
                        return startIndex === i ? i + 1 : i;
                    }
                }
            }
        }

        return -1;
    }

    function setCurrent(currentSectionId, events) {
        if (currentSectionId && currentSectionId !== q.currentSectionId) {
            if (!isSectionAvailable(currentSectionId)) {
                return undefined;
            }

            q.currentSectionId = currentSectionId;
        }

        return {
            id: q.currentSectionId,
            context: q,
            events
        };
    }

    function restoreAnswer(sectionId) {
        const answerToRestore = q.retractedAnswers[sectionId];

        if (answerToRestore !== undefined) {
            q.answers[sectionId] = answerToRestore;
            delete q.retractedAnswers[sectionId];
        }

        return answerToRestore;
    }

    function retractAnswers(sectionIds) {
        const retractedAnswers = [];

        sectionIds.forEach(sectionId => {
            const currentAnswer = q.answers[sectionId];

            if (currentAnswer !== undefined) {
                q.retractedAnswers[sectionId] = currentAnswer;
                delete q.answers[sectionId];
                if (fireEventAtAllMachines) {
                    fireEventAtAllMachines({}, `RETRACT__${sectionId.toUpperCase()}`);
                }
                retractedAnswers.push(currentAnswer);
            }
        });

        return retractedAnswers;
    }

    function addProgress(sectionId, events) {
        // If this section hasn't already been visited, add it to the progress
        if (!q.progress.includes(sectionId)) {
            q.progress.push(sectionId);

            restoreAnswer(sectionId);
        }

        return setCurrent(sectionId, events);
    }

    function removeProgress(startIndex) {
        const removedSectionIds = q.progress.splice(startIndex);

        retractAnswers(removedSectionIds);

        return removedSectionIds;
    }

    // get/set
    function current(currentSectionId) {
        const currentSection = setCurrent(currentSectionId);

        // return a currentSection clone to avoid leaking internal state
        return currentSection ? JSON.parse(JSON.stringify(currentSection)) : currentSection;
    }

    function next(answers, currentSectionId = q.currentSectionId, event = 'ANSWER') {
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
                        removeProgress(cascadeIndex);
                    }
                    // console.log('GOT HERE', `RETRACT__${currentSectionId.toUpperCase()}`);
                    // // next(undefined, currentSectionId, `RETRACT__${currentSectionId.toUpperCase()}`);
                    // fsm.transition(
                    //     {value: currentSectionId},
                    //     `RETRACT__${currentSectionId.toUpperCase()}`,
                    //     q
                    // );
                }
            }
        }

        const state = fsm.transition({value: currentSectionId}, event, q);

        return addProgress(state.value);
    }

    function previous(currentSectionId = q.currentSectionId) {
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa');
        console.log({PROGRESS: q.progress});
        console.log({currentSectionId});
        if (!isSectionAvailable(currentSectionId)) {
            console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
            return undefined;
        }

        console.log('ccccccccccccccccccccccccccccccc');
        // Find the index of the current position
        const currentIndex = q.progress.indexOf(currentSectionId);

        // If we're on the first element, there are no previous sections
        if (currentIndex === 0) {
            console.log('ddddddddddddddddddddddddddd');
            throw Error(`There are no previous sections before section: "${currentSectionId}"`);
        }

        console.log('eeeeeeeeeeeeeeeeeeeeeeeeee');
        // Return the value before the current index
        return setCurrent(q.progress[currentIndex - 1]);
    }

    function first() {
        return {
            id: q.progress[0],
            context: q
        };
    }

    function last() {
        return {
            id: q.progress[q.progress.length - 1],
            context: q
        };
    }

    return Object.freeze({
        current,
        next,
        previous,
        available: isSectionAvailable,
        first,
        last
    });
}

module.exports = qRouter;
