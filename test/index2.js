'use strict';

const qRouter = require('../lib/index');

const createQRouter = qRouter;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function errorMessageToRegExp(errorMessage) {
    return new RegExp(`^${escapeRegExp(errorMessage)}$`);
}

function log(taskId, state) {
    console.log(`${taskId}: `, state.context.progress, state.context.answers.status);
}

const t1 = createQRouter({
    answers: {
        status: 'incomplete'
    },
    routes: {
        initial: 'a',
        states: {
            a: {
                foo: 'foo',
                on: {
                    ANSWER: 'b'
                }
            },
            b: {
                on: {
                    ANSWER: [
                        {
                            target: 'c',
                            cond: ['==', '$.answers.b.q', true]
                        },
                        {
                            target: 'd',
                            cond: ['==', '$.answers.b.q', false]
                        }
                    ]
                }
            },
            c: {
                on: {
                    ANSWER: 'e'
                }
            },
            d: {
                on: {
                    ANSWER: 'd2'
                }
            },
            d2: {
                on: {
                    ANSWER: 'e'
                }
            },
            e: {
                entry: 'complete',
                type: 'final'
            }
        }
    }
});
log('t1', t1.current());
t1.next();
t1.next({q: true});
log('t1', t1.next());

const t2 = createQRouter({
    dependencies: ['t1.d2.q'],
    answers: {
        status: 'incomplete',
        d2: {
            q: true
        }
    },
    routes: {
        on: {
            't1.d2.q_CHANGE': {
                actions: ['|calculateImpact']
            },
            CHANGE: {
                actions: ['|processChange', {'t1.d2.q': true}]
            }
        },
        initial: 'f',
        states: {
            f: {
                on: {
                    ANSWER: [
                        {
                            target: 'h',
                            cond: ['==', '$.answers.d2.q', true]
                        },
                        {
                            target: 'g'
                        }
                    ]
                }
            },
            g: {
                on: {
                    ANSWER: 'i'
                }
            },
            h: {
                on: {
                    ANSWER: 'i'
                }
            },
            i: {
                entry: 'complete',
                type: 'final'
            }
        }
    }
});
log('t2', t2.current());
t2.next();
log('t2', t2.next());

// breaking change... now what???
log('BREAKING CHANGE!!! t1', t1.next({q: false}, 'b'));
log('t1', t1.next());

console.log(t2.findCascadeIndex2('d2'));

t2.removeProgress(t2.findCascadeIndex2('d2'));

log('t2', t2.current());
// t1.next();
// log('t1', t1.next());
// log('BREAKING CHANGE!!! t1', t1.next({q: true}, 'b'));

const t3 = createQRouter({
    routes: {
        context: {
            status: 'incomplete'
        },
        initial: 'j',
        states: {
            j: {
                on: {
                    ANSWER: 'k'
                }
            },
            k: {
                on: {
                    ANSWER: 'l'
                }
            },
            l: {
                entry: 'complete',
                type: 'final'
            }
        }
    }
});
log('t3', t3.current());
t3.next();
log('t3', t3.next());




// const {createMachine} = require('xstate');

// const toggleMachine = createMachine(
//     {
//         id: 'toggle',
//         initial: 'Inactive',
//         states: {
//             Inactive: {
//                 on: {toggle: 'Active'},
//                 entry: 'baz',
//                 exit: 'bar'
//             },
//             Active: {
//                 entry: 'foo',
//                 on: {toggle: 'Inactive'}
//             }
//         }
//     },
//     {
//         actions: {
//             foo: () => {
//                 console.log('foo');
//             }
//         }
//     }
// );

// const {initialState} = toggleMachine;

// console.log(initialState.actions);

// const nextState = toggleMachine.transition(initialState, {type: 'toggle'});

// console.log(nextState.actions);
