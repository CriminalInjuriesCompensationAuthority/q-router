'use strict';

const { createWriteStream } = require('fs-extra');
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
    console.log(`${taskId}: `, state.context.progress, state.context.answers[`${taskId}-status`]);
}

function processEvents(thingWithEvents, machines) {
    const newEvents = [];

    if ('events' in thingWithEvents) {
        thingWithEvents.events.forEach(event => {
            const machinesToTarget = machines.slice(
                machines.findIndex(machine => machine.id === event.source) + 1
            );

            machinesToTarget.forEach(machine => {
                const cascadeIndex = machine.findCascadeIndex2(event.type);

                if (cascadeIndex > -1) {
                    const removedIds = machine.removeProgress(cascadeIndex);
                    const implicitEvents = removedIds.map(removedId => ({
                        type: removedId,
                        source: machine.id
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

function tasklist(machines) {
    const statuses = machines.map((machine, i) => {
        const state = machine.first();

        return {
            id: state.id,
            status: state.context.answers[`t${i + 1}-status`]
        };
    });

    console.log(statuses);
}

function progress(machines) {
    const statuses = machines.map((machine, i) => {
        const state = machine.current();

        return state.context.progress;
    });

    console.log(statuses.flat());
}

const sharedContext = {
    's1-status': 'incomplete',
    't1-status': 'incomplete',
    't2-status': 'incomplete',
    't3-status': 'incomplete',
    't4-status': 'incomplete'
};

const s1 = createQRouter({
    answers: sharedContext,
    routes: {
        id: 's1',
        initial: 'incomplete',
        states: {
            incomplete: {
                on: {
                    T1_COMPLETE: [
                        {
                            target: 'complete',
                            cond: ['|allTasksComplete', ['t1', 't2', 't3', 't4'], true]
                        }
                    ]
                }
            },
            complete: {
                on: {
                    T1_INCOMPLETE: [
                        {
                            target: 'incomplete',
                            cond: ['|allTasksComplete', ['t1', 't2', 't3', 't4'], false]
                        }
                    ]
                }
            }
        }
    }
});

const t1 = createQRouter({
    answers: sharedContext,
    routes: {
        id: 't1',
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
                    ANSWER: [
                        {
                            target: 'e',
                            cond: ['==', true, true],
                            actions: ['raise:d2'],
                            hasDependants: true
                        }
                    ]
                }
            },
            e: {
                entry: 'complete',
                type: 'final'
            }
        }
    }
});

const t2 = createQRouter({
    answers: sharedContext,
    routes: {
        id: 't2',
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
                    ANSWER: 'i',
                    actions: ['raise:g']
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

const t3 = createQRouter({
    answers: sharedContext,
    routes: {
        id: 't3',
        initial: 'j',
        states: {
            j: {
                on: {
                    ANSWER: 'k'
                }
            },
            k: {
                on: {
                    ANSWER: [
                        {
                            target: 'l',
                            cond: ['==', '$.answers.g.q', true]
                        },
                        {
                            target: 'm'
                        }
                    ]
                }
            },
            l: {
                entry: 'complete',
                type: 'final'
            },
            m: {
                entry: 'complete',
                type: 'final',
                exit: 'goto:t4' // ?? how to go stright to the next task and not tasklist
            }
        }
    }
});

const t4 = createQRouter({
    answers: sharedContext,
    routes: {
        id: 't4',
        initial: 'n',
        states: {
            n: {
                on: {
                    ANSWER: 'o'
                }
            },
            o: {
                on: {
                    ANSWER: 'p'
                }
            },
            p: {
                entry: 'complete',
                type: 'final'
            }
        }
    }
});

// complete t1
log('t1', t1.current());
t1.next();
t1.next({q: true});
log('t1', t1.next());

// complete t2
log('t2', t2.current());
t2.next();
log('t2', t2.next({q: true})); // g answer

// complete t3
log('t3', t3.current());
t3.next();
log('t3', t3.next());

// complete t4
log('t4', t4.current());
t4.next();
log('t4', t4.next());

log('t1', t1.next({q: false}, 'b'));
log('t1', t1.next());
console.log('BREAKING CHANGE: ANSWERING D2 HAS IMPLICATIONS ON t2 WHICH HAS IMPLICATIONS ON t3');
const d2AnswerResult = t1.next();

processEvents(d2AnswerResult, [t1, t2, t3, t4]);

log('t1', d2AnswerResult); // d2 answer should raise an event
log('t2', t2.current());
log('t3', t3.current());
log('t4', t4.current());

tasklist([t1, t2, t3, t4]);
progress([t1, t2, t3, t4]);

/*
log('t1', t1.next());

console.log(t2.findCascadeIndex2('d2'));

t2.removeProgress(t2.findCascadeIndex2('d2'));

log('t2', t2.current());
// t1.next();
// log('t1', t1.next());
// log('BREAKING CHANGE!!! t1', t1.next({q: true}, 'b'));
log('t3', t3.current());
t3.next();
log('t3', t3.next());
*/

/*
const {createMachine} = require('xstate');
const toggleMachine = createMachine(
    {
        predictableActionArguments: true,
        id: 'toggle',
        initial: 'Inactive',
        on: {
            toggle: {
                actions: 'qux'
            }
        },
        states: {
            Inactive: {
                on: {toggle: 'Active'},
                entry: 'baz',
                exit: 'bar'
            },
            Active: {
                entry: 'foo',
                on: {toggle: 'Inactive'}
            }
        }
    },
    {
        actions: {
            foo: () => {
                console.log('foo');
            }
        }
    }
);

const {initialState} = toggleMachine;

console.log(initialState.actions);

const nextState = toggleMachine.transition(initialState, {type: 'toggle'});

console.log(nextState.actions);

const mouseMachine = createMachine({
    predictableActionArguments: true,
    on: {
        d2_CHANGE: {
            actions: 'calculateCascade'
        }
    },
    initial: 'a',
    states: {
        a: {
            on: {
                mousemove2: {
                    target: 'b'
                }
            }
        },
        b: {
            type: 'final'
        }
    }
});

const is = mouseMachine.initialState;
const ns = mouseMachine.transition(is, {type: 'mousemove'});
console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#');
console.log(ns.actions)
*/

/*
const {createMachine} = require('xstate');
const fetchMachine = createMachine({
    predictableActionArguments: true,
    id: 'fetch',
    initial: 'idle',
    states: {
        idle: {
            on: {FETCH: {target: 'loading'}}
        },
        loading: {
            after: {
                3000: 'failure.timeout'
            },
            on: {
                RESOLVE: {target: 'success'},
                REJECT: {target: 'failure'},
                TIMEOUT: {target: 'failure.timeout'} // manual timeout
            },
            meta: {
                message: 'Loading...'
            }
        },
        success: {
            meta: {
                message: 'The request succeeded!'
            }
        },
        failure: {
            initial: 'rejection',
            states: {
                rejection: {
                    meta: {
                        message: 'The request failed.'
                    }
                },
                timeout: {
                    meta: {
                        message: 'The request timed out.'
                    }
                }
            },
            meta: {
                alert: 'Uh oh.'
            }
        }
    }
});

const failureTimeoutState = fetchMachine.transition('loading', {
    type: 'TIMEOUT'
});

console.log(failureTimeoutState);
*/


/*
* Model a single task
* Model multiple tasks
* Implement cross task communication
* Task status changes
    * cannot_start
    * incomplete
    * complete
* Task applicability
* Section status changes
* Section applicability
* Cascades (undo previous things, not just answers)
* Dynamic tasklist view
* Addressibility from CW
* CYA compatability
*/

