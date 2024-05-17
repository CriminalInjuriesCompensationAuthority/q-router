'use strict';

const qExpression = require('q-expressions');
const {createActor, assign, setup} = require('xstate');

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

const updateAnswers = assign({
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

const removeFromProgress = assign({
    tasks: ({context, self}) => {
        // eslint-disable-next-line
        const currentState = self._snapshot.value;
        const previousTask = Object.keys(currentState)[0];
        const previousQuestion = Object.values(currentState)[0];

        const updatedTasks = [...context.tasks];
        const taskIndex = updatedTasks.findIndex(task => task.id === previousTask);
        updatedTasks[taskIndex].progress = updatedTasks[taskIndex].progress.filter(
            e => e !== previousQuestion
        );
        return updatedTasks;
    }
});

const tasks = ['t-about-application', 't_applicant_details', 't_applicant_residency'];

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
                            ANSWER: {
                                target: 'p-applicant-are-you-18-or-over'
                            }
                        }
                    },
                    'p-applicant-are-you-18-or-over': {
                        on: {
                            ANSWER: {
                                target: 'p--was-the-crime-reported-to-police'
                            },
                            BACK: {
                                target: 'p-applicant-who-are-you-applying-for'
                            }
                        }
                    },
                    'p--was-the-crime-reported-to-police': {
                        on: {
                            ANSWER: {
                                target: 'p--context-crime-ref-no'
                            },
                            BACK: {
                                target: 'p-applicant-are-you-18-or-over'
                            }
                        }
                    },
                    'p--context-crime-ref-no': {
                        on: {
                            ANSWER: {
                                target: 'p-applicant-fatal-claim'
                            },
                            BACK: {
                                target: 'p--was-the-crime-reported-to-police'
                            }
                        }
                    },
                    'p-applicant-fatal-claim': {
                        on: {
                            ANSWER: {
                                target: 'p-applicant-claim-type'
                            },
                            BACK: {
                                target: 'p--context-crime-ref-no'
                            }
                        }
                    },
                    'p-applicant-claim-type': {
                        on: {
                            ANSWER: {
                                actions: ['updateAnswers'],
                                target: 'p-task-list'
                            },
                            BACK: {
                                target: 'p-applicant-fatal-claim'
                            }
                        }
                    },
                    'p-task-list': {
                        entry: ['updateStatus'],
                        on: {
                            BACK: {
                                target: 'p-applicant-claim-type'
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
                            ANSWER: {
                                target: 'p-applicant-confirmation-method'
                            },
                            BACK: {
                                target: '#t_about_application.p-task-list'
                            }
                        }
                    },
                    'p-applicant-confirmation-method': {
                        on: {
                            ANSWER: {
                                target: 'p-applicant-enter-your-name'
                            },
                            BACK: {
                                target: 'p--context-applicant-details'
                            }
                        }
                    },
                    'p-applicant-enter-your-name': {
                        on: {
                            ANSWER: {
                                target: 'p-applicant-have-you-been-known-by-any-other-names'
                            },
                            BACK: {
                                target: 'p-applicant-confirmation-method'
                            }
                        }
                    },
                    'p-applicant-have-you-been-known-by-any-other-names': {
                        on: {
                            ANSWER: {
                                target: 'p-applicant-enter-your-date-of-birth'
                            },
                            BACK: {
                                target: 'p-applicant-enter-your-name'
                            }
                        }
                    },
                    'p-applicant-enter-your-date-of-birth': {
                        on: {
                            ANSWER: {
                                target: 'p-applicant-enter-your-address'
                            },
                            BACK: {
                                target: 'p-applicant-have-you-been-known-by-any-other-names'
                            }
                        }
                    },
                    'p-applicant-enter-your-address': {
                        on: {
                            ANSWER: {
                                target: 'p-applicant-enter-your-email-address'
                            },
                            BACK: {
                                target: 'p-applicant-enter-your-date-of-birth'
                            }
                        }
                    },
                    'p-applicant-enter-your-email-address': {
                        on: {
                            ANSWER: {
                                actions: ['updateAnswers'],
                                target: 'p-task-list'
                            },
                            BACK: {
                                target: 'p-applicant-enter-your-address'
                            }
                        }
                    },
                    'p-task-list': {
                        entry: ['updateStatus'],
                        on: {
                            BACK: {
                                target: 'p-applicant-enter-your-email-address'
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
                            ANSWER: {
                                target: 'p-applicant-british-citizen'
                            },
                            BACK: {
                                target: '#t_applicant_details.p-task-list'
                            }
                        }
                    },
                    'p-applicant-british-citizen': {
                        on: {
                            ANSWER: {
                                actions: ['updateAnswers'],
                                target: 'p-task-list'
                            },
                            BACK: {
                                target: 'p--context-residency-and-nationality'
                            }
                        }
                    },
                    'p-task-list': {
                        entry: ['updateStatus'],
                        on: {
                            BACK: {
                                target: 'p-applicant-british-citizen'
                            }
                        }
                    }
                }
            }
        },
        on: {
            incrementProgress: {
                actions: ['addToProgress']
            },
            redactProgress: {
                actions: ['removeFromProgress']
            },
            NEXT: tasks.map(taskName => {
                return {
                    target: `.${taskName}`,
                    guard: ({context}) => {
                        const index = context.tasks.findIndex(task => task.status === 'incomplete');
                        const target = context.tasks[index].id;
                        return target === taskName;
                    }
                };
            })
        }
    };

    const taskListSetup = {
        actions: {
            updateStatus,
            addToProgress,
            removeFromProgress,
            updateAnswers
        },
        guards: {
            evaluateRoute: ({event}, params) => {
                return qExpression.evaluate(params.cond, event.extendedState);
            }
        }
    };

    const taskListMachine = setup(taskListSetup).createMachine(taskListSpec);

    const actor = createActor(taskListMachine);

    actor.start();

    function transition(event, answers = {}) {
        if (event === 'ANSWER') {
            // Send the answer
            actor.send({type: event, answers});
            // Update the progress
            actor.send({type: 'incrementProgress'});
        } else if (event === 'NEXT') {
            // Send target to next state
            actor.send({type: event});
            // Update the progress
            actor.send({type: 'incrementProgress'});
        } else if (event === 'BACK') {
            // Redact the Progress
            actor.send({type: 'redactProgress'});
            // Send target to back state
            actor.send({type: event});
        }
        // return the snapshot
        return actor.getSnapshot();
    }

    return Object.freeze({
        transition
    });
}

module.exports = createXStateMachine;
