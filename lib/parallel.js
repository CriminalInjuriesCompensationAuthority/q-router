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

    function processImplicitEvents(objectWithEvents) {
        const newEvents = [];
        const statusUpdateEvent = {
            type: 'fire-event',
            eventName: 'UPDATE__STATUS'
        };

        objectWithEvents.events.push(statusUpdateEvent);
        if ('events' in objectWithEvents && objectWithEvents.events.length > 0) {
            objectWithEvents.events.forEach(event => {
                if ('type' in event) {
                    if (event.type === 'cascade') {
                        const machinesToTarget = machines.slice(
                            machines.findIndex(machine => {
                                return machine.machine.current().context.id === event.sourceId;
                            }) + 1
                        );

                        machinesToTarget.forEach(machine => {
                            const cascadeIndex = machine.machine.findCascadeIndex(event.questionId);

                            if (cascadeIndex > -1) {
                                const removedIds = machine.machine.removeProgress(cascadeIndex);
                                const implicitEvents = removedIds.map(removedId => ({
                                    questionId: removedId,
                                    sourceId: machine.id
                                }));
                                newEvents.push(...implicitEvents);
                            }
                        });
                    }

                    if (event.type === 'fire-event') {
                        fireEventAtAllMachines(event.eventName);
                    }
                }
            });
        }

        if (newEvents.length >= 1) {
            processImplicitEvents({events: newEvents});
        }
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

    function current(sectionId = pq.currentSectionId) {
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

        pq.currentSectionId = currentResponse.context.currentSectionId;
        pq.routes.states[machine.id].progress = currentResponse.context.progress;
        pq.routes.states[machine.id].currentSectionId = currentResponse.context.currentSectionId;

        currentResponse.id = pq.currentSectionId;
        currentResponse.value = getValue();
        currentResponse.context = pq;
        return currentResponse;
    }

    function next(answers, sectionId, event = 'ANSWER') {
        let nextResponse = {};
        const additionalEvents = [];

        let machine = getMachineById(sectionId);
        if (!machine) {
            return undefined;
        }
        const originMachineId = machine.id;

        if (isMachineId(sectionId)) {
            nextResponse = machine.machine.current();
        } else {
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
        }
        nextResponse.events = [...(nextResponse.events || []), ...additionalEvents];

        pq.currentSectionId = nextResponse.context.currentSectionId;
        pq.routes.states[machine.id].progress = nextResponse.context.progress;
        pq.routes.states[machine.id].currentSectionId = nextResponse.context.currentSectionId;

        nextResponse.id = pq.currentSectionId;
        nextResponse.value = getValue();
        nextResponse.context = pq;
        processImplicitEvents(nextResponse);
        return nextResponse;
    }

    function previous(currentSectionId) {
        let previousResponse = {};

        const machine = getMachineById(currentSectionId);
        if (!machine) {
            return undefined;
        }

        // previous throws if you are trying to go to a route before the first route.
        try {
            previousResponse = machine.machine.previous(currentSectionId);
        } catch (err) {
            // If `.previous()` is called on a machine that state is the initial state, it
            // will throw. Catch that and inspect the error. If it is that specific error
            // AND there is no referrer defined, then rethrow to mimic the index.js qRouter.
            // If it is that error AND a referrer IS defined, then fall through and get the
            // current state of the machine defined in the referrer.

            if (
                err.message ===
                    `There are no previous sections before section: "${currentSectionId}"` &&
                machine.machine.current().context.routes.referrer === undefined
            ) {
                // rethrow if not what is expected.
                throw err;
            }
            previousResponse = current(machine.machine.current().context.routes.referrer);
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

    function available(sectionId) {
        const machine = getMachineWithSpecificPageId(sectionId);
        return machine.machine.available(sectionId);
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
        available,
        first,
        last
    });
}

module.exports = createParallelRouter;
