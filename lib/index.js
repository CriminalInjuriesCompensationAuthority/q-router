'use strict';

const qRouter = require('./router');

function createParallelRouter({spec}) {
    // // the presence of an id indicates that a
    // // single machine is needed for the supplied
    // // states.
    // if ('id' in spec.routes) {
    //     return qRouter(spec);
    // }

    // don't put the macines status in the extended state (shared context). maintain the status in the machine itself
    const {sharedContext} = spec.tasklistv2;
    const machineSpecs = spec.tasklistv2.machines;
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
                        console.log({
                            thing1: machine.current().id,
                            thing2: sharedContext.status
                        });
                        sharedContext.status[machine.current().id] = 'incomplete';
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
                    // id: machineSpecs[i].id,
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

    function getMachineWithSpecificPageId(sectionId) {
        const machineWithSectionId = machines.find(machine => {
            return machine.current().context.progress.includes(sectionId);
        });
        return machineWithSectionId;
    }

    function next(answers, sectionId, event = 'ANSWER') {
        // if the `sectionId` is already in the progress, this
        // question is being answred again.
        let machineWithpreviouslyAnsweredQuestion;
        let state;

        if (sectionId) {
            machineWithpreviouslyAnsweredQuestion = getMachineWithSpecificPageId(sectionId);
        }

        if (machineWithpreviouslyAnsweredQuestion) {
            state = machineWithpreviouslyAnsweredQuestion.next(answers, sectionId, event);
        } else {
            // otherwise just find the fist incomplete machine and carry on.
            const firstIncompleteMachine = machines.find(
                machine => getMachineStatus(machine) === 'incomplete'
            );
            state = firstIncompleteMachine.next(answers, sectionId, event);
        }

        processEvents(state);
        return state;
    }

    function current() {
        const firstIncompleteMachine = machines.find(
            machine => getMachineStatus(machine) === 'incomplete'
        );
        return firstIncompleteMachine.current();
    }

    return Object.freeze({
        next,
        current,
        machines
    });
}

module.exports = createParallelRouter;
