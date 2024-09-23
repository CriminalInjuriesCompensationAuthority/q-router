'use strict';

const qRouter = require('.');

function createParallelRouter(spec) {
    const pq = {...spec};
    const machines = [];
    const machineSpecs = pq.routes.states;
    const machineIds = Object.keys(machineSpecs);
    pq.attributes.q__statuses = pq.attributes.q__statuses || {};

    // https://stately.ai/docs/parallel-states#parallel-state-value
    function getValue() {
        const value = pq.attributes.q__statuses;

        for (let i = 0; i < machines.length; i += 1) {
            const machine = machines[i].machine.current();
            value[machineIds[i]] = machine.context.currentSectionId;
        }

        return value;
    }

    function isMachineId(machineId) {
        if (machineId.startsWith('#')) {
            return true;
        }
        return false;
    }

    function getMachineWithSpecificPageId(sectionId) {
        const machineWithSectionId = machines.find(machine => {
            return sectionId in machine.machine.current().context.routes.states;
        });
        return machineWithSectionId;
    }

    function getMachineByMachineId(machineId) {
        const id = machineId.replace('#', '');
        const machineWithSpecificId = machines.find(machine => {
            return machine.id === id;
        });
        return machineWithSpecificId;
    }

    function getMachineById(sectionId) {
        if (isMachineId(sectionId)) {
            return getMachineByMachineId(sectionId);
        }

        return getMachineWithSpecificPageId(sectionId);
    }

    function getMachineApplicabilityStatusByMachineId(machineId) {
        return getValue()[`${machineId}__applicability-status`] || 'applicable';
    }

    function fireEventAtAllMachines(event) {
        const ignorableErrorMessages = [
            'There are no next sections after section:',
            `q-router - Event: "${event}" not found on state:`
        ];

        for (let i = 0; i < machines.length; i += 1) {
            const machineCurrentSectionId = getValue()[machines[i].id];
            try {
                const state = machines[i].machine.next(undefined, machineCurrentSectionId, event);

                if (state !== undefined) {
                    pq.routes.states[machines[i].id].progress = state.context.progress;
                    pq.routes.states[machines[i].id].currentSectionId =
                        state.context.currentSectionId;
                    pq.attributes.q__statuses = getValue();
                }
            } catch (err) {
                if (
                    !ignorableErrorMessages.some(errorMessagePrefix =>
                        err.message.startsWith(errorMessagePrefix)
                    )
                ) {
                    // rethrow if not what is expected.
                    throw err;
                }
            }
        }

        return pq;
    }

    function removeDuplicateEvents(eventsQueue) {
        return eventsQueue.filter((eventQueueObject, i, originalEventsQueueArray) => {
            // remove all duplicate events, retaining the last instance of
            // that event in the array.
            const lastIndex = originalEventsQueueArray.findLastIndex(
                eventQueueObject2 =>
                    JSON.stringify(eventQueueObject2) === JSON.stringify(eventQueueObject) // ES6 guarantees property order.
            );
            return lastIndex === i;
        });
    }

    function processImplicitEvents(objectWithEvents) {
        const statusUpdateEvent = {
            type: 'fire-event',
            eventName: 'UPDATE__STATUS'
        };

        objectWithEvents.events.push(statusUpdateEvent);
        const eventsQueue = removeDuplicateEvents(objectWithEvents.events);

        const processEvent = event => {
            if (!('type' in event)) {
                return;
            }

            if (event.type === 'cascade') {
                machines.forEach(machine => {
                    const cascadeIndex = machine.machine.findCascadeIndex(event.questionId);
                    if (cascadeIndex === -1) {
                        return;
                    }

                    const removedIds = machine.machine
                        .removeProgress(cascadeIndex)
                        .filter(progressItem => !isMachineId(progressItem));

                    if (removedIds.length > 0) {
                        const implicitEvents = removedIds.map(removedId => ({
                            type: 'cascade',
                            questionId: removedId,
                            sourceId: machine.id
                        }));

                        const specificPageId = getMachineWithSpecificPageId(
                            removedIds[0]
                        ).id.toUpperCase();
                        implicitEvents.push({
                            type: 'fire-event',
                            eventName: `CASCADE__${specificPageId}`,
                            sourceId: machine.id
                        });

                        eventsQueue.push(...implicitEvents);
                    }
                });
            } else if (event.type === 'fire-event') {
                fireEventAtAllMachines(event.eventName);
            }
        };

        while (eventsQueue.length > 0) {
            const event = eventsQueue.shift();
            processEvent(event);
        }
    }

    function isAvailable(sectionId) {
        let sectionIdAvailable = true;
        const machine = getMachineById(sectionId);
        if (machine === undefined) {
            return false;
        }
        const machineApplicabilityStatus = getMachineApplicabilityStatusByMachineId(machine.id);

        if (!isMachineId(sectionId)) {
            sectionIdAvailable = machine.machine.available(sectionId);
        }
        return machineApplicabilityStatus === 'applicable' && sectionIdAvailable;
    }

    function current(sectionId = pq.currentSectionId) {
        if (!isAvailable(sectionId)) {
            return undefined;
        }
        let currentResponse = {};
        const machine = getMachineById(sectionId);
        // is it addressing a different machine entirely?
        if (isMachineId(sectionId)) {
            // get the target machine's state.
            currentResponse = machine.machine.current();
        } else {
            // otherwise set the current state of the current machine.
            currentResponse = machine.machine.current(sectionId);
            if (!currentResponse) {
                return undefined;
            }
        }

        pq.routes.states[machine.id].progress = currentResponse.context.progress;
        pq.currentSectionId = currentResponse.context.currentSectionId;
        pq.routes.states[machine.id].currentSectionId = currentResponse.context.currentSectionId;

        currentResponse.id = pq.currentSectionId;
        currentResponse.value = getValue();
        currentResponse.context = pq;
        return currentResponse;
    }

    function next(answers, sectionId, event = 'ANSWER') {
        if (!isAvailable(sectionId)) {
            return undefined;
        }
        let nextResponse = {};
        const additionalEvents = [];

        let machine = getMachineById(sectionId);
        if (!machine) {
            return undefined;
        }
        const originMachineId = machine.id;

        nextResponse = machine.machine.next(answers, sectionId, event);
        if (!nextResponse) {
            return undefined;
        }
        // if the current is a new machine id, then get its current.
        if (isMachineId(nextResponse.id)) {
            machine = getMachineById(nextResponse.id);
            nextResponse = machine.machine.current();
            additionalEvents.push({
                type: 'fire-event',
                eventName: `COMPLETE__${originMachineId.toUpperCase()}`,
                source: originMachineId
            });
        }
        nextResponse.events = [...(nextResponse.events || []), ...additionalEvents];

        pq.routes.states[machine.id].progress = nextResponse.context.progress.slice();
        processImplicitEvents(nextResponse);
        pq.currentSectionId = nextResponse.context.currentSectionId;
        pq.retractedAnswers = {...pq.retractedAnswers, ...nextResponse.context.retractedAnswers};
        pq.routes.states[machine.id].currentSectionId = nextResponse.context.currentSectionId;

        nextResponse.id = pq.currentSectionId;
        nextResponse.value = getValue();
        nextResponse.context = pq;
        return nextResponse;
    }

    function previous(currentSectionId) {
        if (!isAvailable(currentSectionId)) {
            return undefined;
        }
        let previousResponse = {};

        const machine = getMachineById(currentSectionId);
        if (!machine) {
            return undefined;
        }

        const currentState = machine.machine.current();

        if (
            currentState.context.routes.referrer &&
            currentSectionId === currentState.context.routes.initial
        ) {
            previousResponse = current(currentState.context.routes.referrer);
        } else {
            previousResponse = machine.machine.previous(currentSectionId);
        }

        if (previousResponse) {
            pq.currentSectionId = previousResponse.context.currentSectionId;
            pq.routes.states[machine.id].progress = previousResponse.context.progress;
            pq.routes.states[machine.id].currentSectionId =
                previousResponse.context.currentSectionId;

            previousResponse.id = pq.currentSectionId;
            previousResponse.value = getValue();
            previousResponse.context = pq;
            return previousResponse;
        }

        return undefined;
    }

    function first() {
        const {currentSectionId} = pq;
        let firstResponse = {};
        const machine = getMachineWithSpecificPageId(currentSectionId);
        if (!machine) {
            return undefined;
        }

        firstResponse = machine.machine.first();

        pq.routes.states[machine.id].progress = firstResponse.context.progress;
        pq.routes.states[machine.id].currentSectionId = firstResponse.context.currentSectionId;

        firstResponse.value = getValue();
        firstResponse.context = pq;
        return firstResponse;
    }

    function last() {
        const {currentSectionId} = pq;
        let lastResponse = {};
        const machine = getMachineWithSpecificPageId(currentSectionId);
        if (!machine) {
            return undefined;
        }

        lastResponse = machine.machine.last();

        pq.routes.states[machine.id].progress = lastResponse.context.progress;
        pq.routes.states[machine.id].currentSectionId = lastResponse.context.currentSectionId;

        lastResponse.value = getValue();
        lastResponse.context = pq;
        return lastResponse;
    }

    // set up all machines.
    for (let i = 0; i < machineIds.length; i += 1) {
        const machineSpec = {...machineSpecs[machineIds[i]]};
        machines.push({
            id: machineIds[i],
            machine: qRouter({
                id: machineSpec.id,
                answers: pq.answers,
                retractedAnswers: pq.retractedAnswers,
                progress: machineSpec.progress,
                // adding a `routes` property in order to
                // maintain compatibility with the q-router.
                routes: {
                    referrer: machineSpec.referrer,
                    initial: machineSpec.initial,
                    states: machineSpec.states
                },
                currentSectionId: machineSpec.currentSectionId || machineSpec.initial,
                attributes: {
                    q__roles: pq.attributes.q__roles,
                    q__statuses: pq.attributes.q__statuses
                }
            })
        });
    }

    if (pq.attributes.q__statuses === undefined) {
        pq.attributes.q__statuses = getValue();
    }

    return Object.freeze({
        current,
        next,
        previous,
        available: isAvailable,
        first,
        last
    });
}

module.exports = createParallelRouter;
