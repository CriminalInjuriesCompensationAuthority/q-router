'use strict';

const qRouter = require('.');

function createParallelRouter(spec) {
    const machines = [];
    const machineSpecs = spec.routes.states;
    const machineIds = Object.keys(machineSpecs);

    // set up all machines.
    for (let i = 0; i < machineIds.length; i += 1) {
        const machineSpec = {...machineSpecs[machineIds[i]]};
        machines.push({
            id: machineIds[i],
            machine: qRouter({
                answers: spec.answers,
                retractedAnswers: spec.retractedAnswers,
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
                    q__roles: spec.attributes.q__roles
                }
            })
        });
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

    // https://stately.ai/docs/parallel-states#parallel-state-value
    function getValue() {
        const value = {};

        for (let i = 0; i < machines.length; i += 1) {
            const machine = machines[i].machine.current();
            value[machineIds[i]] = machine.context.currentSectionId;
        }

        return value;
    }

    function current(sectionId = spec.currentSectionId) {
        const newSpec = spec;
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

        newSpec.currentSectionId = currentResponse.context.currentSectionId;
        newSpec.routes.states[machine.id].progress = currentResponse.context.progress;
        newSpec.routes.states[machine.id].currentSectionId =
            currentResponse.context.currentSectionId;

        currentResponse.id = newSpec.currentSectionId;
        currentResponse.value = getValue();
        currentResponse.context = newSpec;
        return currentResponse;
    }

    function next(answers, sectionId, event = `ANSWER__${sectionId.toUpperCase()}`) {
        const newSpec = spec;
        let nextResponse = {};

        const machine = getMachineById(sectionId);
        if (!machine) {
            return undefined;
        }

        if (isMachineId(sectionId)) {
            nextResponse = machine.machine.current();
        } else {
            nextResponse = machine.machine.next(answers, sectionId, event);
            if (!nextResponse) {
                return undefined;
            }
        }

        newSpec.currentSectionId = nextResponse.context.currentSectionId;
        newSpec.routes.states[machine.id].progress = nextResponse.context.progress;
        newSpec.routes.states[machine.id].currentSectionId = nextResponse.context.currentSectionId;

        nextResponse.id = newSpec.currentSectionId;
        nextResponse.value = getValue();
        nextResponse.context = newSpec;
        return nextResponse;
    }

    function previous(currentSectionId) {
        const newSpec = spec;
        let previousResponse = {};

        const machine = getMachineById(currentSectionId);
        if (!machine) {
            return undefined;
        }

        const currentState = machine.machine.current();

        if (currentSectionId === currentState.context.routes.initial) {
            previousResponse = current(currentState.context.routes.referrer);
        } else {
            previousResponse = machine.machine.previous(currentSectionId);
        }

        if (previousResponse) {
            newSpec.currentSectionId = previousResponse.context.currentSectionId;
            newSpec.routes.states[machine.id].progress = previousResponse.context.progress;
            newSpec.routes.states[machine.id].currentSectionId =
                previousResponse.context.currentSectionId;

            previousResponse.id = newSpec.currentSectionId;
            previousResponse.value = getValue();
            previousResponse.context = newSpec;
            return previousResponse;
        }

        return undefined;
    }

    function available(sectionId) {
        const machine = getMachineWithSpecificPageId(sectionId);
        return machine.machine.available(sectionId);
    }

    function first() {
        const newSpec = spec;
        const {currentSectionId} = newSpec;
        let firstResponse = {};
        const machine = getMachineWithSpecificPageId(currentSectionId);
        if (!machine) {
            return undefined;
        }

        firstResponse = machine.machine.first();

        newSpec.routes.states[machine.id].progress = firstResponse.context.progress;
        newSpec.routes.states[machine.id].currentSectionId = firstResponse.context.currentSectionId;

        firstResponse.value = getValue();
        firstResponse.context = newSpec;
        return firstResponse;
    }

    function last() {
        const newSpec = spec;
        const {currentSectionId} = newSpec;
        let lastResponse = {};
        const machine = getMachineWithSpecificPageId(currentSectionId);
        if (!machine) {
            return undefined;
        }

        lastResponse = machine.machine.last();

        newSpec.routes.states[machine.id].progress = lastResponse.context.progress;
        newSpec.routes.states[machine.id].currentSectionId = lastResponse.context.currentSectionId;

        lastResponse.value = getValue();
        lastResponse.context = newSpec;
        return lastResponse;
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
