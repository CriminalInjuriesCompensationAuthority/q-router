'use strict';

const qRouter = require('./router');

function createParallelRouter({spec}) {
    // // the presence of an id indicates that a
    // // single machine is needed for the supplied
    // // states.
    // if ('id' in spec.routes) {
    //     return qRouter(spec);
    // }

    const {sharedContext} = spec.tasklistv2;
    const machineSpecs = spec.tasklistv2.machines;
    // const machineNames = Object.keys(machineSpecs);
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
                console.log({eventQuestionId: event.questionId});
                machinesToTarget.forEach(machine => {
                    const cascadeIndex = machine.findCascadeIndex(event.questionId);

                    if (cascadeIndex > -1) {
                        const removedIds = machine.removeProgress(cascadeIndex);
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
            processEvents({events: newEvents}, machines);
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
            // console.log('###################################################');
            // console.log(sectionId);
            // console.log(machine.current().context.id);
            // console.log(machine.current().context.progress.includes(sectionId));
            // console.log('###################################################');
            return machine.current().context.progress.includes(sectionId);
        });
        // console.log({statuses: machineWithSectionId.current().context.status});
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

    // run .next()
    // if task is not complete, go to next page in task
    // if task is complete, then go to next task. do not kill the previous machine yet.
    // if all tasks are complete then kill all the machines.

    return Object.freeze({
        next,
        current,
        machines
    });
}

module.exports = createParallelRouter;
