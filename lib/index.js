'use strict';

// const semverLte = require('semver/functions/lte');
const qRouter = require('./router');

function createParallelRouter(spec) {
    // // the presence of an id indicates that a
    // // single machine is needed for the supplied
    // // states.
    // if ('id' in spec.routes) {
    //     return qRouter(spec);
    // }

    // if (semverLte(spec?.meta?.questionnaireDocumentVersion, '6.0.0')) {
    //     return qRouter(spec);
    // }

    // don't put the machines status in the extended state (shared context). maintain the status in the machine itself
    const {sharedContext} = spec.routes;
    const machineSpecs = spec.routes.machines;
    const machines = [];

    function processEvents(thingWithEvents) {
        const newEvents = [];

        if ('events' in thingWithEvents) {
            thingWithEvents.events.forEach(event => {
                const machinesToTarget = machines.slice(
                    machines.findIndex(machine => {
                        return machine.current().id === event.sourceId;
                    }) + 1
                );
                machinesToTarget.forEach(machine => {
                    const cascadeIndex = machine.findCascadeIndex(event.questionId);

                    if (cascadeIndex > -1) {
                        const removedIds = machine.removeProgress(cascadeIndex);
                        machine.updateTaskStatus('incomplete');
                        const implicitEvents = removedIds.map(removedId => ({
                            questionId: removedId,
                            sourceId: machine.id
                        }));
                        newEvents.push(...implicitEvents);
                    }
                });
            });
        }

        if (newEvents.length >= 1) {
            processEvents({events: newEvents});
        }
    }

    for (let i = 0; i < machineSpecs.length; i += 1) {
        machines.push(
            qRouter(
                {
                    ...sharedContext,
                    ...machineSpecs[i]
                },
                spec.attributes.q__roles
            )
        );
    }

    function getMachineStatus(machine) {
        const currentState = machine.current();
        return currentState.context.status[currentState.context.id];
    }

    // should this be first or next machine?
    function getFirstIncompleteMachine() {
        return machines.find(machine => getMachineStatus(machine) === 'incomplete');
    }

    function setAllMachineNotActive() {
        for (let i = 0; i < machines.length; i += 1) {
            machines.active = false;
        }
    }

    function getActiveMachine() {
        const activeMachine = machines.find(machine => machine.current().context.active === true);
        return activeMachine;
    }

    function getMachineWithSpecificPageId(sectionId) {
        const machineWithSectionId = machines.find(machine => {
            return machine.current().context.progress.includes(sectionId);
        });
        return machineWithSectionId;
    }

    function next(answers, sectionId, event = 'ANSWER') {
        // a machine will set itself active when next() is called
        // on that machine.
        setAllMachineNotActive();

        // if the `sectionId` is already in the progress, this
        // question is being answered again.
        let machineWithpreviouslyAnsweredQuestion;
        let state;

        if (sectionId) {
            machineWithpreviouslyAnsweredQuestion = getMachineWithSpecificPageId(sectionId);
        }

        if (machineWithpreviouslyAnsweredQuestion) {
            state = machineWithpreviouslyAnsweredQuestion.next(answers, sectionId, event);
        } else {
            // otherwise just find the first incomplete machine and carry on.
            const firstIncompleteMachine = getFirstIncompleteMachine();
            state = firstIncompleteMachine.next(answers, sectionId, event);
        }

        processEvents(state);
        return state;
    }

    function current() {
        const activeMachine = getActiveMachine();

        if (activeMachine) {
            return activeMachine.current();
        }

        const firstIncompleteMachine = getFirstIncompleteMachine();
        return firstIncompleteMachine.current();
    }

    function previous(currentSectionId) {
        const activeMachine = getActiveMachine();

        if (activeMachine) {
            return activeMachine.previous(currentSectionId);
        }

        // TODO: what is the behaviour for reaching the first page of a task and wanting to go to previous? go to task-list?
        throw Error(`There are no previous sections before section: "${currentSectionId}"`);
    }

    function first() {
        const activeMachine = getActiveMachine();
        return activeMachine.first();
    }

    function last() {
        const activeMachine = getActiveMachine();
        return activeMachine.last();
    }

    function isSectionAvailable(sectionId) {
        const activeMachine = getActiveMachine();
        return activeMachine.available(sectionId);
    }

    return Object.freeze({
        current,
        next,
        previous,
        available: isSectionAvailable,
        first,
        last,
        getActiveMachine
    });
}

module.exports = createParallelRouter;
