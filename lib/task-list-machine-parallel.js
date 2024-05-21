'use strict';

const qExpression = require('q-expressions');
const {createActor, assign, setup, raise} = require('xstate');

const updateStatus = assign({
    tasks: ({context, self}) => {
        // eslint-disable-next-line
        const currentState = self._snapshot.value;
        const currentTask = Object.keys(currentState)[0];
        const updatedTasks = [...context.tasks];
        const index = updatedTasks.findIndex(task => task.id === currentTask);
        updatedTasks[index].status = 'complete';
        if (index + 1 < updatedTasks.length) {
            updatedTasks[index + 1].status = 'incomplete';
        }
        return updatedTasks;
    }
});

const addToAnswers = assign({
    tasks: ({context, event, self}) => {
        // eslint-disable-next-line
        const currentState = self._snapshot.value;
        const currentTask = Object.keys(currentState)[0];
        const currentQuestion = Object.values(currentState)[0];
        const updatedTasks = [...context.tasks];
        const index = updatedTasks.findIndex(task => task.id === currentTask);
        updatedTasks[index].answers[currentQuestion] = event.answers;
        return updatedTasks;
    }
});

const addToProgress = assign({
    tasks: ({context, self}) => {
        // eslint-disable-next-line
        const currentState = self._snapshot.value;
        const nextTask = Object.keys(currentState)[0];
        const nextQuestion = Object.values(currentState)[0];
        const updatedTasks = [...context.tasks];
        const index = updatedTasks.findIndex(task => task.id === nextTask);
        updatedTasks[index].progress.push(nextQuestion);
        return updatedTasks;
    }
});

const saveSnapshot = assign({
    snapshots: ({context, event, self}) => {
        // eslint-disable-next-line
        const currentState = self._snapshot.value;
        const currentStateName = `${Object.keys(currentState)[0]}.${
            Object.values(currentState)[0]
        }`;

        const updatedContext = [...context.snapshots];
        const currentSnapshot = {};
        currentSnapshot[currentStateName] = event.persistedSnapshot;
        updatedContext.push(currentSnapshot);
        return updatedContext;
    }
});

function createXStateMachine() {
    const taskListSpec = {
        id: 'task-list-machine',
        initial: 't-about-application',
        context: {
            tasks: [
                {
                    id: 't-about-application',
                    progress: ['p-applicant-who-are-you-applying-for'],
                    answers: {},
                    status: 'incomplete'
                },
                {
                    id: 't_applicant_details',
                    progress: [],
                    answers: {},
                    status: 'cannotStart'
                },
                {
                    id: 't_applicant_residency',
                    progress: [],
                    answers: {},
                    status: 'cannotStart'
                }
            ]
        },
        states: {
            't-about-application': {
                id: 't_about_application',
                initial: 'p-applicant-who-are-you-applying-for',
                states: {
                    'p-applicant-who-are-you-applying-for': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-are-you-18-or-over'
                            }
                        }
                    },
                    'p-applicant-are-you-18-or-over': {
                        on: {
                            NEXT: {
                                target: 'p--was-the-crime-reported-to-police'
                            }
                        }
                    },
                    'p--was-the-crime-reported-to-police': {
                        on: {
                            NEXT: {
                                target: 'p--context-crime-ref-no'
                            }
                        }
                    },
                    'p--context-crime-ref-no': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-fatal-claim'
                            }
                        }
                    },
                    'p-applicant-fatal-claim': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-claim-type'
                            }
                        }
                    },
                    'p-applicant-claim-type': {
                        on: {
                            NEXT: {
                                target: 'p-task-list'
                            }
                        }
                    },
                    'p-task-list': {
                        entry: ['updateStatus'],
                        on: {
                            NEXT: {
                                target: '#t_applicant_details',
                                guard: {
                                    type: 'canBeStarted',
                                    params: {
                                        target: 't_applicant_details'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            t_applicant_details: {
                id: 't_applicant_details',
                initial: 'p--context-applicant-details',
                states: {
                    'p--context-applicant-details': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-confirmation-method'
                            }
                        }
                    },
                    'p-applicant-confirmation-method': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-enter-your-name'
                            }
                        }
                    },
                    'p-applicant-enter-your-name': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-have-you-been-known-by-any-other-names'
                            }
                        }
                    },
                    'p-applicant-have-you-been-known-by-any-other-names': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-enter-your-date-of-birth'
                            }
                        }
                    },
                    'p-applicant-enter-your-date-of-birth': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-enter-your-address'
                            }
                        }
                    },
                    'p-applicant-enter-your-address': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-enter-your-email-address'
                            }
                        }
                    },
                    'p-applicant-enter-your-email-address': {
                        on: {
                            NEXT: {
                                target: 'p-task-list'
                            }
                        }
                    },
                    'p-task-list': {
                        entry: ['updateStatus'],
                        on: {
                            NEXT: {
                                target: '#t_applicant_residency',
                                guard: {
                                    type: 'canBeStarted',
                                    params: {
                                        target: 't_applicant_residency'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            t_applicant_residency: {
                id: 't_applicant_residency',
                initial: 'p--context-residency-and-nationality',
                states: {
                    'p--context-residency-and-nationality': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-british-citizen'
                            }
                        }
                    },
                    'p-applicant-british-citizen': {
                        on: {
                            NEXT: {
                                target: 'p-task-list'
                            }
                        }
                    },
                    'p-task-list': {
                        entry: ['updateStatus']
                    }
                }
            }
        },
        on: {
            incrementProgress: {
                actions: ['addToProgress']
            },
            saveSnapshot: {
                actions: ['saveSnapshot']
            },
            ANSWER: {
                actions: ['addToAnswers', raise({type: 'NEXT'})]
            },
            FIRST: {
                target: '#task-list-machine'
            },
            LAST: {
                type: 'history',
                history: 'deep'
            }
        }
    };

    const taskListSetup = {
        actions: {
            updateStatus,
            addToProgress,
            addToAnswers,
            saveSnapshot
        },
        guards: {
            evaluateRoute: ({event}, params) => {
                return qExpression.evaluate(params.cond, event.extendedState);
            },
            canBeStarted: ({context}, params) => {
                const statuses = context.tasks.reduce((obj, task) => {
                    // eslint-disable-next-line
                    obj[task.id] = task.status;
                    return obj;
                });
                return statuses[params.target] === 'incomplete';
            }
        }
    };

    const taskListMachine = setup(taskListSetup).createMachine(taskListSpec);

    function transition(event, answers = {}, previousEvents = []) {
        const events = [...previousEvents];

        const actor = createActor(taskListMachine, {
            inspect: inspectionEvent => {
                if (inspectionEvent.type === '@xstate.event') {
                    events.push(inspectionEvent);
                }
            }
        });

        // start the machine
        actor.start();

        // replay the events
        previousEvents.forEach(previousEvent => {
            // eslint-disable-next-line
            const {context} = previousEvent.actorRef._snapshot;
            // eslint-disable-next-line
            const previousEventState = previousEvent.actorRef._snapshot.value;
            const previousEventType = previousEvent.event.type;
            if (previousEventType === 'ANSWER') {
                const previousEventTask = Object.keys(previousEventState)[0];
                const previousEventQuestion = Object.values(previousEventState)[0];
                const index = context.tasks.findIndex(task => task.id === previousEventTask);
                const previousEventAnswers = context.tasks[index].answers[previousEventQuestion];
                actor.send('ANSWER', previousEventAnswers);
            } else {
                actor.send({type: previousEventType});
            }
        });

        if (event === 'ANSWER') {
            // Send the answer
            actor.send({type: 'ANSWER', answers});
            // Update the progress
            actor.send({type: 'incrementProgress'});
        } else if (event === 'NEXT') {
            // Send target to next state
            actor.send({type: 'NEXT'});
            // Update the progress
            actor.send({type: 'incrementProgress'});
        } else if (event === 'FIRST' || event === 'LAST') {
            // Send target to next/first/last state
            actor.send({type: event});
        }
        const currentSnapshot = actor.getSnapshot();

        actor.stop();
        // return the snapshots
        return {currentSnapshot, events};
    }

    /*    function isSectionAvailable(sectionId) {
        const {context} = actor.getSnapshot();
        let isInProgress = false;
        context.tasks.forEach(task => {
            if (task.progress.includes(sectionId)) {
                isInProgress = true;
            }
        });
        return isInProgress;
    }

    function getContext() {
        return actor.getSnapshot().context;
    } */

    return Object.freeze({
        transition
        /*     isSectionAvailable,
        getContext */
    });
}

module.exports = createXStateMachine;
