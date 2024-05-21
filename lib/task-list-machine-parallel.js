'use strict';

const qExpression = require('q-expressions');
const {createActor, assign, setup, enqueueActions} = require('xstate');

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
            ANSWER: {
                actions: ['answerQuestion']
            },
            ADVANCE: {
                actions: ['nextQuestion']
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
            answerQuestion: enqueueActions(({enqueue}) => {
                enqueue('addToAnswers');
                enqueue.raise({type: 'NEXT'});
                enqueue.raise({type: 'incrementProgress'});
            }),
            nextQuestion: enqueueActions(({enqueue}) => {
                enqueue.raise({type: 'NEXT'});
                enqueue.raise({type: 'incrementProgress'});
            })
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
        let newEvent = {};

        const actor = createActor(taskListMachine, {
            inspect: inspectionEvent => {
                if (
                    inspectionEvent.type === '@xstate.event' &&
                    inspectionEvent.event.type !== 'xstate.init'
                ) {
                    newEvent = inspectionEvent;
                }
            }
        });

        // start the machine
        actor.start();

        // replay the events
        previousEvents.forEach(previousEvent => {
            const previousEventType = previousEvent.event.type;
            if (previousEventType === 'ANSWER') {
                const previousEventAnswers = previousEvent.event.answers;
                actor.send({type: previousEventAnswers, previousEventAnswers});
            } else {
                actor.send({type: previousEventType});
            }
        });

        if (event === 'ANSWER') {
            // Send the answer
            actor.send({type: 'ANSWER', answers});
            // Update the progress
            // actor.send({type: 'incrementProgress'});
        } else if (event === 'ADVANCE') {
            // Send target to next state
            actor.send({type: 'ADVANCE'});
            // Update the progress
            // actor.send({type: 'incrementProgress'});
        } else if (event === 'FIRST' || event === 'LAST') {
            // Send target to next/first/last state
            actor.send({type: event});
        }
        events.push(newEvent);
        const currentSnapshot = actor.getSnapshot();
        actor.stop();
        // return the snapshots
        return {currentSnapshot, events};
    }

    return Object.freeze({
        transition
    });
}

module.exports = createXStateMachine;
