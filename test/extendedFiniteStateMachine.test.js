'use strict';

const createMachine = require('../lib/extendedFiniteStateMachine');

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function errorMessageToRegExp(errorMessage) {
    return new RegExp(`^${escapeRegExp(errorMessage)}$`);
}

describe('Extended finite state machine', () => {
    describe('Transition', () => {
        it('should throw if a transition definition is not a string or object literal', () => {
            const fsm = createMachine({
                initial: 'a',
                states: {
                    a: {
                        on: {
                            ANSWER: 123
                        }
                    },
                    b: {
                        type: 'final'
                    }
                }
            });
            const rxExpectedError = errorMessageToRegExp(
                `q-router - A transition definition must be either a string, object literal, or array. Instead, recieved: 123`
            );

            expect(() => fsm.transition({value: 'a'}, 'ANSWER', {})).toThrow(rxExpectedError);
        });

        it('should throw if no event is declared', () => {
            const fsm = createMachine({
                initial: 'a',
                states: {
                    a: {
                        on: {}
                    },
                    b: {
                        type: 'final'
                    }
                }
            });
            const rxExpectedError = errorMessageToRegExp(
                `q-router - Event: "ANSWER" not found on state: "a"`
            );

            expect(() => fsm.transition({value: 'a'}, 'ANSWER', {})).toThrow(rxExpectedError);
        });

        it('should indicate if the returned next state is final', () => {
            const fsm = createMachine({
                initial: 'a',
                states: {
                    a: {
                        on: {
                            ANSWER: 'b'
                        }
                    },
                    b: {
                        type: 'final'
                    }
                }
            });

            const state = fsm.transition({value: 'a'}, 'ANSWER', {});

            expect(state).toEqual({
                value: 'b',
                context: {},
                changed: true,
                done: true,
                history: {
                    value: 'a'
                }
            });
        });

        it('should include metadata with the initial state', () => {
            const fsm = createMachine({
                initial: 'a',
                context: {},
                states: {
                    a: {
                        on: {
                            ANSWER: 'b'
                        }
                    },
                    b: {
                        type: 'final'
                    }
                }
            });

            const {initialState} = fsm;

            expect(initialState).toEqual({
                value: 'a',
                context: {},
                changed: undefined,
                done: false,
                history: undefined
            });
        });

        describe("Given an event's transition definition is declared as a string ('on' property)", () => {
            it('should indicate that a transition took place', () => {
                const fsm = createMachine({
                    initial: 'a',
                    states: {
                        a: {
                            on: {
                                ANSWER: 'b'
                            }
                        },
                        b: {
                            type: 'final'
                        }
                    }
                });

                const state = fsm.transition({value: 'a'}, 'ANSWER', {});

                expect(state).toEqual({
                    value: 'b',
                    context: {},
                    changed: true,
                    done: true,
                    history: {
                        value: 'a'
                    }
                });
            });
        });

        describe("Given an event's transition definition is declared as an object ('on' property)", () => {
            it('should indicate that a transition took place', () => {
                const fsm = createMachine({
                    initial: 'a',
                    states: {
                        a: {
                            on: {
                                ANSWER: {target: 'b'}
                            }
                        },
                        b: {
                            type: 'final'
                        }
                    }
                });

                const state = fsm.transition({value: 'a'}, 'ANSWER', {});

                expect(state).toEqual({
                    value: 'b',
                    context: {},
                    changed: true,
                    done: true,
                    history: {
                        value: 'a'
                    }
                });
            });

            it('should indicate that no transition took place', () => {
                const fsm = createMachine({
                    initial: 'a',
                    states: {
                        a: {
                            on: {
                                ANSWER: {target: 'b', cond: ['==', 'foo', 'bar']}
                            }
                        },
                        b: {
                            type: 'final'
                        }
                    }
                });

                const state = fsm.transition({value: 'a'}, 'ANSWER', {});

                expect(state).toEqual({
                    value: 'a',
                    context: {},
                    changed: false,
                    done: false,
                    history: undefined
                });
            });
        });

        describe("Given an event has an array of transition definitions ('on' property)", () => {
            it('should indicate that a transition took place', () => {
                const fsm = createMachine({
                    initial: 'a',
                    states: {
                        a: {
                            on: {
                                ANSWER: [
                                    {target: 'b', cond: ['==', 'foo', 'bar']},
                                    {target: 'c', cond: ['==', 'foo', 'foo']},
                                    {target: 'd', cond: ['==', 'foo', 'baz']}
                                ]
                            }
                        },
                        b: {
                            type: 'final'
                        },
                        c: {
                            type: 'final'
                        },
                        d: {
                            type: 'final'
                        }
                    }
                });

                const state = fsm.transition({value: 'a'}, 'ANSWER', {});

                expect(state).toEqual({
                    value: 'c',
                    context: {},
                    changed: true,
                    done: true,
                    history: {
                        value: 'a',
                        successfulGuardIndex: 1
                    }
                });
            });

            it('should indicate that no transition took place', () => {
                const fsm = createMachine({
                    initial: 'a',
                    states: {
                        a: {
                            on: {
                                ANSWER: [
                                    {target: 'b', cond: ['==', 'foo', 'bar']},
                                    {target: 'c', cond: ['==', 'foo', 'baz']},
                                    {target: 'd', cond: ['==', 'foo', 'biz']}
                                ]
                            }
                        },
                        b: {
                            type: 'final'
                        },
                        c: {
                            type: 'final'
                        },
                        d: {
                            type: 'final'
                        }
                    }
                });

                const state = fsm.transition({value: 'a'}, 'ANSWER', {});

                expect(state).toEqual({
                    value: 'a',
                    context: {},
                    changed: false,
                    done: false,
                    history: undefined
                });
            });

            it('should indicate that no transition took place 2', () => {
                const fsm = createMachine({
                    initial: 'a',
                    states: {
                        a: {
                            on: {
                                ANSWER: [
                                    {target: 'b', cond: ['==', 'foo', 'foo']},
                                    {target: 'c', cond: ['==', 'foo', 'bar']},
                                    {target: 'd', cond: ['==', 'foo', 'biz']}
                                ]
                            }
                        },
                        b: {
                            on: {
                                ANSWER: [
                                    {target: 'c', cond: ['==', 'foo', 'bar']},
                                    {target: 'd', cond: ['==', 'foo', 'biz']}
                                ]
                            }
                        },
                        c: {
                            type: 'final'
                        },
                        d: {
                            type: 'final'
                        }
                    }
                });

                const state1 = fsm.transition({value: 'a'}, 'ANSWER', {}); // transitions to "b"
                const state2 = fsm.transition({value: 'b'}, 'ANSWER', {}); // no guard passes, remain on "b"

                expect(state1).toEqual({
                    value: 'b',
                    context: {},
                    changed: true,
                    done: false,
                    history: {value: 'a', successfulGuardIndex: 0}
                });

                expect(state2).toEqual({
                    value: 'b',
                    context: {},
                    changed: false,
                    done: false,
                    history: undefined
                });
            });
        });
    });
});
