'use strict';

const createMachine = require('./extendedFiniteStateMachine');
const deepEqual = require('./deepEqual');

const defaults = {};
defaults.qExpressions = require('q-expressions');

function qRouter(spec, qExpressions = defaults.qExpressions) {
    const q = {...spec};
    const fsm = createMachine(q.routes, qExpressions);
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
        if (!(sectionId in q.routes.states)) {
            return false;
        }
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
            if (sectionRoutes && 'on' in sectionRoutes) {
                // https://stately.ai/docs/transitions
                const transitions = Object.keys(sectionRoutes.on);
                const targets =
                    sectionRoutes.on[transitions.find(prop => prop.startsWith('ANSWER'))];

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
                        // return the index after the cascade-causing index.
                        return i + 1;
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
        // don't empty the whole progress. Otherwise the
        // task will not be reachable.
        let index = startIndex;
        if (index === 0) {
            index = 1;
        }
        const removedSectionIds = q.progress.splice(index);
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
        let removedSectionIds = [];
        const events = [];

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
                        removedSectionIds = removeProgress(cascadeIndex);
                        if ('id' in q) {
                            events.push(
                                {
                                    type: 'cascade',
                                    questionId: currentSectionId,
                                    sourceId: q.id
                                },
                                {
                                    type: 'fire-event',
                                    eventName: `CASCADE__${q.id.toUpperCase()}`,
                                    sourceId: q.id
                                }
                            );
                        }
                    }
                }
            }
        }
        if (removedSectionIds.length > 0) {
            removedSectionIds.forEach(removedSectionId => {
                events.push({
                    type: 'cascade',
                    questionId: removedSectionId,
                    sourceId: q.id
                });
            });
        }

        const state = fsm.transition({value: currentSectionId}, event, q);

        return addProgress(state.value, events);
    }

    function previous(currentSectionId = q.currentSectionId) {
        if (!isSectionAvailable(currentSectionId)) {
            return undefined;
        }

        // Find the index of the current position
        const currentIndex = q.progress.indexOf(currentSectionId);

        // If we're on the first element, there are no previous sections
        if (currentIndex === 0) {
            throw Error(`There are no previous sections before section: "${currentSectionId}"`);
        }

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
        last,
        removeProgress,
        findCascadeIndex
    });
}

module.exports = qRouter;
