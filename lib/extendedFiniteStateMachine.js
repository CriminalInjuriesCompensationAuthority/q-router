'use strict';

/* const spec = {
    answers: {},
    progress: ['p-initial'],
    routes: {
        initial: 'p-initial',
        referrer: 'https://foobar.com',
        summary: ['p-applicant-declaration'],
        confirmation: 'p--confirmation',
        states: {
            'p-initial': {
                on: {
                    ANSWER: [
                        {
                            target: 'p-applicant-name',
                            guard: {
                                type: 'evaluateRoute',
                                params: {
                                    cond: ['>', 10, 1]
                                }
                            }
                        },
                        {
                            target: 'p-applicant-age',
                            guard: {
                                type: 'evaluateRoute',
                                params: {
                                    cond: ['>', 1, 6]
                                }
                            }
                        },
                        {
                            target: 'p-applicant-end'
                        }
                    ]
                }
            },
            'p-applicant-name': {
                on: {
                    ANSWER: [
                        {
                            target: 'p-applicant-age',
                            guard: {
                                type: 'evaluateRoute',
                                params: {
                                    cond: ['==', 'foo', 'foo']
                                }
                            }
                        },
                        {
                            target: 'p-applicant-end'
                        }
                    ]
                }
            },
            'p-applicant-age': {
                on: {
                    ANSWER: [
                        {
                            target: 'p-applicant-end'
                        }
                    ]
                }
            },
            'p-applicant-end': {
                type: 'final'
            }
        }
    }
}; */

const qExpression = require('q-expressions');
const {createMachine, createActor} = require('xstate');

function createXStateMachine(spec) {
    const questionnaireMachine = createMachine(
        {
            initial: spec.initial,
            states: spec.states
        },
        {
            guards: {
                evaluateRoute: ({event}, params) => {
                    return qExpression.evaluate(params.cond, event.extendedState);
                }
            }
        }
    );

    const actor = createActor(questionnaireMachine);

    actor.start();

    // { section1: {} } { type: 'ANSWER' } section1
    function transition(currentState, event, extendedState) {
        actor.send({type: event, extendedState});
        return actor.getSnapshot();
    }

    return Object.freeze({
        transition
    });
}

module.exports = createXStateMachine;
