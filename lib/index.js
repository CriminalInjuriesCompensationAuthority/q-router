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
    const machineSpecs = spec.routes.states;
    const machines = [];

    const machineStatus = ['completed', 'incomplete'];
    const taskStatus = ['cannotStartYet', 'applicable', 'inapplicable'];

    function getStatuses() {
        const statuses = {};
        for (let i = 0; i < machines.length; i += 1) {
            const currentState = machines[i].current();
            statuses[currentState.context.id] = {
                machine: currentState.context.machineStatus,
                task: currentState.context.taskStatus
            };
        }
        return statuses;
    }

    function getMachineWithSpecificPageId(sectionId) {
        const machineWithSectionId = machines.find(machine => {
            return sectionId in machine.current().context.routes.states;
        });
        return machineWithSectionId;
    }

    function getMachineById(machineId) {
        const foundMachine = machines.find(machine => {
            return machine.current().context.id === machineId;
        });
        return foundMachine;
    }

    function setCurrent(currentId) {
        // // If the task or question is unavailable
        // if (!extendedStateHelper.isAvailable(superRouterSpec, currentId, taskMachines)) {
        //     throw new Error(`The state "${currentId}" is not available`);
        // }

        // // Refresh the super router's context
        // updateSuperContext();

        // If the Id is the task list
        if (currentId === 'p-task-list') {
            // // Set the current Id
            // superRouterSpec.currentSectionId = 'p-task-list';
            // // Check for and handle any cascade events
            // const cascadeEvents = superRouterSpec.events.filter(event => event.type === 'cascade');
            // cascadeEvents.forEach(event => {
            //     extendedStateHelper.propagateCascade(taskMachines, event);
            // });
            // // remove processed events
            // superRouterSpec.events = superRouterSpec.events.filter(
            //     event => !cascadeEvents.includes(event)
            // );

            // // Update context again to check for effect of cascades
            // updateSuperContext();

            return {
                id: 'p-task-list',
                context: superRouterSpec
            };
        }

        // If `currentId` is different, update the super router
        if (currentId && currentId !== superRouterSpec.currentSectionId) {
            superRouterSpec.currentSectionId = currentId;
        }

        // swap back to spec.routes.states to prevent exposing the machines and allow rehydration.
        superRouterSpec.routes = extendedStateHelper.persistContext(superRouterSpec, taskMachines);

        // Get shared progress
        superRouterSpec.progress = extendedStateHelper.getSharedProgress(taskMachines);

        return {
            id: superRouterSpec.currentSectionId,
            context: superRouterSpec
        };
    }


    function getAssocciatedMachineStatusMachineForRoutingMachineById(machineId) {
        const assocciatedMachineId = `${machineId}__machine-status`;
        return getMachineById(assocciatedMachineId);
    }

    function getAssocciatedTaskStatusMachineForRoutingMachineById(machineId) {
        const assocciatedMachineId = `${machineId}__task-status`;
        return getMachineById(assocciatedMachineId);
    }

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

    // set up all machines.
    for (let i = 0; i < machineSpecs.length; i += 1) {
        machines.push(
            qRouter({
                answers: spec.answers,
                ...machineSpecs[i],
                attributes: {
                    q__roles: spec.attributes.q__roles
                }
            })
        );
    }

    // function current() {
    //     return getStatus();
    // }

    function doEvents(state) {
        if ('events' in state) {
            state.events.forEach(event => {
                if ('type' in event) {
                    const eventType = event.type;
                    let eventName;
                    let eventTarget;

                    if (eventType.includes('__')) {
                        [eventName, eventTarget] = eventType.split('__');

                        if (eventName === 'completed') {
                            const machineToUpdate = getMachineById(eventTarget);
                            machineToUpdate.updateContext('machineStatus', 'completed');
                        }
                    }
                }
            });
        }

        // const machineStatusMachine = getAssocciatedMachineStatusMachineForRoutingMachineById(
        //     state.context.id
        // );
        // const taskStatusMachine = getAssocciatedTaskStatusMachineForRoutingMachineById(
        //     state.context.id
        // );

        // const machineStatusMachineState = getStatus()[machineStatusMachine.current().context.id];
        // const taskStatusMachineState = getStatus()[taskStatusMachine.current().context.id];
        // const newEvents = [];

        // if ('events' in state) {
        //     state.events.forEach(event => {
        //         if ('type' in event) {
        //             const eventType = event.type;
        //             let eventName;
        //             let eventTarget;
        //             if (eventType.includes('__')) {
        //                 [eventName, eventTarget] = eventType.split('__');
        //             }
        //             console.log({
        //                 eventName,
        //                 eventTarget
        //             });
        //             if (eventName === 'completed') {
        //                 const statusMachine = getAssocciatedMachineStatusMachineForRoutingMachineById(
        //                     eventTarget
        //                 );
        //                 console.log(
        //                     {},
        //                     getStatus()[statusMachine.current().context.id],
        //                     event.type,
        //                     statusMachine.current()
        //                 );
        //                 statusMachine.next(
        //                     {},
        //                     getStatus()[statusMachine.current().context.id],
        //                     event.type
        //                 );
        //             }
        //         }
        //         try {
        //             const statusState = machineStatusMachine.next(
        //                 {},
        //                 machineStatusMachineState,
        //                 event.type
        //             );
        //             const taskState = taskStatusMachine.next(
        //                 {},
        //                 taskStatusMachineState,
        //                 event.type
        //             );
        //             if (statusState.events) {
        //                 newEvents.push(...statusState.events);
        //             }
        //             if (taskState.events) {
        //                 newEvents.push(...taskState.events);
        //             }
        //         } catch (err) {}
        //     });
        // }

        // if (newEvents.length >= 1) {
        //     doEvents({events: newEvents});
        // }
    }

    function updateImplicitMachine(currentSpec, currentMachineState) {
        const newSpec = structuredClone(spec);

        newSpec.routes.currentSectionId = currentMachineState.id;

        newSpec.progress = currentSpec.routes.states.flatMap(
            machineDefinition => machineDefinition.progress
        );
        newSpec.currentSectionId = currentMachineState.context.currentSectionId;
        newSpec.retractedAnswers = currentSpec.routes.states.reduce((acc, machineDefinition) => {
            return {
                ...acc,
                ...machineDefinition.retractedAnswers
            };
        }, {});
        // console.log({getStatuses: getStatuses()});
        newSpec.statuses = getStatuses();

        return newSpec;
    }

    function next(answers, sectionId, event = 'ANSWER') {
        const currentMachine = getMachineWithSpecificPageId(sectionId);
        const currentMachineState = currentMachine.next(answers, sectionId, event);
        doEvents(currentMachineState);

        return {
            id: currentMachineState.id,
            context: updateImplicitMachine(spec, currentMachineState)
        };
    }

    // function getMachineStatus(machine) {
    //     const currentState = machine.current();
    //     return currentState.context.status[currentState.context.id];
    // }

    // // should this be first or next machine?
    // function getFirstIncompleteMachine() {
    //     return machines.find(machine => getMachineStatus(machine) === 'incomplete');
    // }

    // function setAllMachineNotActive() {
    //     for (let i = 0; i < machines.length; i += 1) {
    //         machines.active = false;
    //     }
    // }

    // function getActiveMachine() {
    //     const activeMachine = machines.find(machine => machine.current().context.active === true);
    //     return activeMachine;
    // }

    // function getMachineWithSpecificPageId(sectionId) {
    //     const machineWithSectionId = machines.find(machine => {
    //         return machine.current().context.progress.includes(sectionId);
    //     });
    //     return machineWithSectionId;
    // }

    // function next(answers, sectionId, event = 'ANSWER') {
    //     // a machine will set itself active when next() is called
    //     // on that machine.
    //     setAllMachineNotActive();

    //     // if the `sectionId` is already in the progress, this
    //     // question is being answered again.
    //     let machineWithpreviouslyAnsweredQuestion;
    //     let state;

    //     if (sectionId) {
    //         machineWithpreviouslyAnsweredQuestion = getMachineWithSpecificPageId(sectionId);
    //     }

    //     if (machineWithpreviouslyAnsweredQuestion) {
    //         state = machineWithpreviouslyAnsweredQuestion.next(answers, sectionId, event);
    //     } else {
    //         // otherwise just find the first incomplete machine and carry on.
    //         const firstIncompleteMachine = getFirstIncompleteMachine();
    //         state = firstIncompleteMachine.next(answers, sectionId, event);
    //     }

    //     // else??
    //     // throw if finished?

    //     processEvents(state);
    //     return state;
    // }

    // function current() {
    //     const activeMachine = getActiveMachine();

    //     if (activeMachine) {
    //         return activeMachine.current();
    //     }

    //     const firstIncompleteMachine = getFirstIncompleteMachine();
    //     return firstIncompleteMachine.current();
    // }

    // function previous(currentSectionId) {
    //     const activeMachine = getActiveMachine();

    //     if (activeMachine) {
    //         return activeMachine.previous(currentSectionId);
    //     }

    //     // TODO: what is the behaviour for reaching the first page of a task and wanting to go to previous? go to task-list?
    //     throw Error(`There are no previous sections before section: "${currentSectionId}"`);
    // }

    // function first() {
    //     const activeMachine = getActiveMachine();
    //     return activeMachine.first();
    // }

    // function last() {
    //     const activeMachine = getActiveMachine();
    //     return activeMachine.last();
    // }

    // function isSectionAvailable(sectionId) {
    //     const activeMachine = getActiveMachine();
    //     return activeMachine.available(sectionId);
    // }

    return Object.freeze({
        // current,
        next // ,
        // previous,
        // available: isSectionAvailable,
        // first,
        // last // ,
        // // getActiveMachine
    });
}

module.exports = createParallelRouter;
