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
                            },
                            PREVIOUS: {
                                target: 'p-applicant-who-are-you-applying-for'
                            }
                        }
                    },
                    'p--was-the-crime-reported-to-police': {
                        on: {
                            NEXT: {
                                target: 'p--context-crime-ref-no'
                            },
                            PREVIOUS: {
                                target: 'p-applicant-are-you-18-or-over'
                            }
                        }
                    },
                    'p--context-crime-ref-no': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-fatal-claim'
                            },
                            PREVIOUS: {
                                target: 'p--was-the-crime-reported-to-police'
                            }
                        }
                    },
                    'p-applicant-fatal-claim': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-claim-type'
                            },
                            PREVIOUS: {
                                target: 'p--context-crime-ref-no'
                            }
                        }
                    },
                    'p-applicant-claim-type': {
                        on: {
                            NEXT: {
                                target: 'p-task-list'
                            },
                            PREVIOUS: {
                                target: 'p-applicant-fatal-claim'
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
                            },
                            PREVIOUS: {
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
                            NEXT: {
                                target: 'p-applicant-confirmation-method'
                            },
                            PREVIOUS: {
                                target: '#t_about_application.p-task-list'
                            }
                        }
                    },
                    'p-applicant-confirmation-method': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-enter-your-name'
                            },
                            PREVIOUS: {
                                target: 'p--context-applicant-details'
                            }
                        }
                    },
                    'p-applicant-enter-your-name': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-have-you-been-known-by-any-other-names'
                            },
                            PREVIOUS: {
                                target: 'p-applicant-confirmation-method'
                            }
                        }
                    },
                    'p-applicant-have-you-been-known-by-any-other-names': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-enter-your-date-of-birth'
                            },
                            PREVIOUS: {
                                target: 'p-applicant-enter-your-name'
                            }
                        }
                    },
                    'p-applicant-enter-your-date-of-birth': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-enter-your-address'
                            },
                            PREVIOUS: {
                                target: 'p-applicant-have-you-been-known-by-any-other-names'
                            }
                        }
                    },
                    'p-applicant-enter-your-address': {
                        on: {
                            NEXT: {
                                target: 'p-applicant-enter-your-email-address'
                            },
                            PREVIOUS: {
                                target: 'p-applicant-enter-your-date-of-birth'
                            }
                        }
                    },
                    'p-applicant-enter-your-email-address': {
                        on: {
                            NEXT: {
                                target: 'p-task-list'
                            },
                            PREVIOUS: {
                                target: 'p-applicant-enter-your-address'
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
                            },
                            PREVIOUS: {
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
                            NEXT: {
                                target: 'p-applicant-british-citizen'
                            },
                            PREVIOUS: {
                                target: '#t_applicant_details.p-task-list'
                            }
                        }
                    },
                    'p-applicant-british-citizen': {
                        on: {
                            NEXT: {
                                target: 'p-task-list'
                            },
                            PREVIOUS: {
                                target: 'p--context-residency-and-nationality'
                            }
                        }
                    },
                    'p-task-list': {
                        entry: ['updateStatus'],
                        on: {
                            PREVIOUS: {
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
            ANSWER: {
                actions: ['addToAnswers', raise({type: 'NEXT'})]
            },
            BACK: {
                actions: [raise({type: 'PREVIOUS'})]
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
            removeFromProgress,
            addToAnswers
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

    const actor = createActor(taskListMachine);

    actor.start();

    function transition(event, answers = {}) {
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
        } else if (event === 'BACK') {
            // Redact the Progress
            actor.send({type: 'redactProgress'});
            // Send target to previous state
            actor.send({type: 'BACK'});
        } else if (event === 'FIRST' || event === 'LAST') {
            // Send target to next/first/last state
            actor.send({type: event});
        }
        // return the snapshot
        return actor.getSnapshot();
    }

    function isSectionAvailable(sectionId) {
        const {context} = actor.getSnapshot();
        let isInProgress = false;
        context.tasks.forEach(task => {
            if (task.progress.includes(sectionId)) {
                isInProgress = true;
            }
        });
        return isInProgress;
    }

    return Object.freeze({
        transition,
        isSectionAvailable
    });
}

module.exports = createXStateMachine;
