'use strict';

const createMachine = require('./extendedFiniteStateMachine');
const deepEqual = require('./deepEqual');
const xStateMachine = require('./task-list-machine-parallel')();

function qRouter(spec) {
    const q = {...spec};
    const fsm = createMachine(q.routes);
    const roles = q.attributes?.q__roles;
    q.answers = q.answers || {};
    q.retractedAnswers = q.retractedAnswers || {};
    q.progress = q.progress || [q.routes.initial];
    q.currentSectionId = q.currentSectionId || q.progress[q.progress.length - 1];

    // enable feature toggling.
    q.answers.system = {
        ...q.answers.system,
        env: process.env.APP_ENV
    };

    function isSectionAvailable(sectionId) {
        return xStateMachine.isSectionAvailable(sectionId);
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
                        return startIndex === i ? i + 1 : i;
                    }
                }
            }
        }

        return -1;
    }

    function setCurrent(currentSectionId) {
        if (currentSectionId && currentSectionId !== q.currentSectionId) {
            if (!isSectionAvailable(currentSectionId)) {
                return undefined;
            }

            q.currentSectionId = currentSectionId;
        }

        return {
            id: q.currentSectionId,
            context: q
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

                retractedAnswers.push(currentAnswer);
            }
        });

        return retractedAnswers;
    }

    function addProgress(sectionId) {
        // If this section hasn't already been visited, add it to the progress
        if (!q.progress.includes(sectionId)) {
            q.progress.push(sectionId);

            restoreAnswer(sectionId);
        }

        return setCurrent(sectionId);
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
                }
            }
        }

        const state = fsm.transition({value: currentSectionId}, event, q);

        return addProgress(state.value);
    }

    function previous(currentSectionId) {
        if (!isSectionAvailable(currentSectionId)) {
            return undefined;
        }

        return xStateMachine.transition('BACK').value;
    }

    function first() {
        return xStateMachine.transition('FIRST').value;
    }

    function last() {
        return xStateMachine.transition('LAST').value;
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
