'use strict';

const createMachine = require('./extendedFiniteStateMachine');
const deepEqual = require('./deepEqual');

function qRouter(spec) {
    const q = {...spec};
    const fsm = createMachine(q.routes);
    const roles = q.attributes?.q__roles;
    q.answers = q.answers || {};
    q.events = q.events || [];
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
            id: q.progress[0] || q.routes.initial,
            context: q
        };
    }

    function last() {
        return {
            id: q.progress[q.progress.length - 1],
            context: q
        };
    }

    // Differences from `findCascadeIndex`:
    // Handle instances where no sectionRoutes exist.
    // -- This is now needed because the task list appears in the progress but not the states.

    function findCascadeIndex2(sectionId) {
        const startIndex = q.progress.indexOf(sectionId);

        for (let i = startIndex, sectionRoutes; i < q.progress.length; i += 1) {
            // Route formats:
            // { on: { ANSWER: 'c' } }
            // { on: { ANSWER: [ [Object], [Object], ... ] } }
            // { type: 'final' }
            sectionRoutes = q.routes.states[q.progress[i]];

            // If there is an "on" attribute there may be conditions
            // The task list's routes are unknown to it's child machine's, so ignore undefined routes
            if (sectionRoutes && 'on' in sectionRoutes) {
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

    function nextStateIsTaskList(sectionId) {
        return sectionId === 'p-task-list';
    }

    // Differences from `next`:
    // Sets status and events
    // Doesn't throw on 'final' states
    // Extended state on transition is parameter, not q
    function next2(answers, currentSectionId = q.currentSectionId, event = 'ANSWER', superContext) {
        if (!isSectionAvailable(currentSectionId)) {
            return undefined;
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

                    const cascadeIndex = findCascadeIndex2(currentSectionId);

                    // Remove all progress after the cascade index
                    if (cascadeIndex > -1) {
                        removeProgress(cascadeIndex);
                        q.routes.status = 'incomplete';
                        q.events.push({type: 'cascade', value: currentSectionId, origin: q.id});
                    }
                }
            }
        }

        const state = fsm.transition({value: currentSectionId}, event, superContext);

        if (nextStateIsTaskList(state.value)) {
            q.routes.status = 'complete';
        }

        return addProgress(state.value);
    }

    function externalCascade(questionId) {
        const cascadeIndex = findCascadeIndex2(questionId);

        // Remove all progress after the cascade index
        if (cascadeIndex > -1) {
            // Remove all progress after the cascade index
            removeProgress(cascadeIndex + 1);
            // Update the context
            const targetQuestionId = q.progress[cascadeIndex] || q.routes.initial;
            q.routes.status = 'incomplete';
            q.currentSectionId = targetQuestionId;
            // This change could itself cause a cascade, so raise the event
            q.events.push({type: 'cascade', value: targetQuestionId, origin: q.id});
        }
        return q;
    }

    function clearCascadeEvent(event) {
        // Remove the target event from the events array
        q.events = q.events.filter(eventObject => eventObject !== event);
        return q;
    }

    return Object.freeze({
        current,
        next,
        previous,
        available: isSectionAvailable,
        first,
        last,
        next2,
        externalCascade,
        clearCascadeEvent
    });
}

module.exports = qRouter;
