'use strict';

jest.doMock('q-expressions', () => {
    return {
        evaluate: jest.fn(cond => {
            return cond[1] === 'A';
        })
    };
});
jest.doMock('../lib/router', () => spec => {
    return {
        first: () => {
            return {id: 'A'};
        },
        last: jest.fn(() => {
            if (spec.id === '1') {
                return {
                    context: {
                        progress: ['A', 'B'],
                        status: 'incomplete',
                        answers: {A: 'foobar', B: 'foobar'},
                        events: [{type: 'cascade', origin: '1'}]
                    }
                };
            }
            if (spec.id === '2') {
                return {
                    context: {
                        progress: ['D', 'E', 'F'],
                        status: 'complete',
                        answers: {D: 'foobar', E: 'foobar', F: 'foobar'},
                        events: [{type: 'cascade', origin: '2'}]
                    }
                };
            }
            if (spec.id === '3') {
                return {
                    context: {
                        progress: ['G'],
                        status: 'incomplete',
                        answers: {G: 'foobar'},
                        events: []
                    }
                };
            }
            if (spec.id === '4') {
                return {
                    context: {}
                };
            }
            return {
                context: {
                    progress: ['A'],
                    status: 'incomplete',
                    answers: {A: 'foobar'},
                    events: [{type: 'cascade'}]
                }
            };
        }),
        clearCascadeEvent: jest.fn(),
        externalCascade: jest.fn(),
        next2: jest.fn(() => {
            return {id: 'B'};
        })
    };
});

const createHelper = require('../lib/extendedStateHelper');

describe('extendedStateHelper tests', () => {
    describe('setupParallelMachines', () => {
        it('Should return a superRouterSpec and TaskMachines object', () => {
            const spec = {
                routes: {
                    states: [
                        {
                            id: '1',
                            initial: 'A',
                            states: {
                                A: {},
                                B: {},
                                C: {}
                            }
                        },
                        {
                            id: '2',
                            states: {
                                D: {},
                                E: {},
                                F: {}
                            }
                        }
                    ]
                }
            };
            const helper = createHelper(spec);
            const result = helper.setupParallelMachines();
            expect('superRouterSpec' in result).toEqual(true);
            expect('taskMachines' in result).toEqual(true);
        });
        it('Should return a TaskMachines object with a key for each task ID', () => {
            const spec = {
                routes: {
                    states: [
                        {
                            id: '1',
                            initial: 'A',
                            states: {
                                A: {},
                                B: {},
                                C: {}
                            }
                        },
                        {
                            id: '2',
                            states: {
                                D: {},
                                E: {},
                                F: {}
                            }
                        }
                    ]
                }
            };
            const helper = createHelper(spec);
            const result = helper.setupParallelMachines();
            expect(Object.keys(result.taskMachines)).toEqual(['1', '2']);
        });
        it('Should return a SuperRouterSpec with a currentSectionId and routes', () => {
            const spec = {
                routes: {
                    states: [
                        {
                            id: '1',
                            initial: 'A',
                            states: {
                                A: {},
                                B: {},
                                C: {}
                            }
                        },
                        {
                            id: '2',
                            states: {
                                D: {},
                                E: {},
                                F: {}
                            }
                        }
                    ]
                }
            };
            const helper = createHelper(spec);
            const result = helper.setupParallelMachines();
            const expected = {
                currentSectionId: 'A',
                initial: '1',
                routes: {
                    states: [
                        {
                            id: '1',
                            initial: 'A',
                            states: {
                                A: {},
                                B: {},
                                C: {}
                            }
                        },
                        {
                            id: '2',
                            states: {
                                D: {},
                                E: {},
                                F: {}
                            }
                        }
                    ]
                }
            };
            expect(result.superRouterSpec).toEqual(expected);
        });
        it('Should return a SuperRouterSpec with a pre-loaded context if provided', () => {
            const spec = {
                routes: {
                    states: [
                        {
                            id: '1',
                            initial: 'A',
                            states: {
                                A: {},
                                B: {},
                                C: {}
                            },
                            answers: {A: 'foobar'},
                            progress: ['A', 'B'],
                            status: 'incomplete',
                            events: [{type: 'event'}]
                        },
                        {
                            id: '2',
                            states: {
                                D: {},
                                E: {},
                                F: {}
                            }
                        }
                    ]
                },
                currentSectionId: 'B'
            };
            const helper = createHelper(spec);
            const result = helper.setupParallelMachines();
            const expected = {
                currentSectionId: 'B',
                initial: '1',
                routes: {
                    states: [
                        {
                            id: '1',
                            initial: 'A',
                            states: {
                                A: {},
                                B: {},
                                C: {}
                            },
                            answers: {
                                A: 'foobar'
                            },
                            progress: ['A', 'B'],
                            status: 'incomplete',
                            events: [{type: 'event'}]
                        },
                        {
                            id: '2',
                            states: {
                                D: {},
                                E: {},
                                F: {}
                            }
                        }
                    ]
                }
            };
            expect(result.superRouterSpec).toEqual(expected);
        });
    });

    describe('getTaskIdFromQuestionId', () => {
        const spec = {
            routes: {
                states: [
                    {
                        id: '1',
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        }
                    },
                    {
                        id: '2',
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        }
                    },
                    {
                        id: '3',
                        states: {
                            G: {},
                            H: {},
                            I: {}
                        }
                    }
                ]
            }
        };
        const helper = createHelper(spec);
        it('Should get the task Id of which the question belongs to', () => {
            const result = helper.getTaskIdFromQuestionId('A');
            expect(result).toEqual('1');
        });

        it('Should throw an error if it cannot find the target', () => {
            expect(() => helper.getTaskIdFromQuestionId('not-a-question')).toThrow(
                `The state "not-a-question" does not exist`
            );
        });
    });

    describe('getTaskContext', () => {
        const spec = {
            routes: {
                states: [
                    {
                        id: '1',
                        initial: 'A',
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        }
                    },
                    {
                        id: '2',
                        initial: 'D',
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        }
                    },
                    {
                        id: '3',
                        initial: 'G',
                        states: {
                            G: {},
                            H: {},
                            I: {}
                        }
                    }
                ]
            }
        };
        const helper = createHelper(spec);
        it('Should get context of the specified task', () => {
            const result = helper.getTaskContext('1');
            expect('progress' in result).toEqual(true);
        });
        it('Should throw is task is undefined', () => {
            expect(() => helper.getTaskContext(undefined)).toThrow(
                'The task "undefined" does not exist'
            );
        });
        it('Should throw is task is not found', () => {
            expect(() => helper.getTaskContext('not-a-task')).toThrow(
                'The task "not-a-task" does not exist'
            );
        });
    });

    describe('isAvailable', () => {
        const spec = {
            routes: {
                states: [
                    {
                        id: '1',
                        initial: 'A',
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        }
                    },
                    {
                        id: '2',
                        initial: 'D',
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        }
                    },
                    {
                        id: '3',
                        initial: 'G',
                        states: {
                            G: {},
                            H: {},
                            I: {}
                        }
                    }
                ],
                guards: {
                    '1': {
                        cond: ['==', 'A', 'A']
                    },
                    '2': {
                        cond: ['==', 'B', 'A']
                    }
                }
            },
            taskStatuses: {
                '1': 'incomplete',
                '2': 'notApplicable',
                '3': 'incomplete'
            }
        };
        const helper = createHelper(spec);
        it('Should return false if the Id is undefined', () => {
            const result = helper.isAvailable(undefined);
            expect(result).toEqual(false);
        });
        it('Should return true for "p-task-list"', () => {
            const result = helper.isAvailable('p-task-list');
            expect(result).toEqual(true);
        });
        it('Should return true if it finds the target in  a machines progress', () => {
            const result = helper.isAvailable('A');
            expect(result).toEqual(true);
        });
        it('Should return false if it does not find the target in a machines progress', () => {
            const result = helper.isAvailable('H');
            expect(result).toEqual(false);
        });
    });

    describe('getPreviousQuestionId', () => {
        const spec = {
            routes: {
                states: [
                    {
                        id: '1',
                        initial: 'A',
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        }
                    },
                    {
                        id: '2',
                        initial: 'D',
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        }
                    },
                    {
                        id: '3',
                        initial: 'G',
                        states: {
                            G: {},
                            H: {},
                            I: {}
                        }
                    },
                    {
                        id: '4',
                        initial: 'J',
                        states: {
                            J: {},
                            K: {},
                            L: {}
                        }
                    }
                ]
            },
            currentSectionId: 'B'
        };
        const helper = createHelper(spec);
        it('Should get the previous states pageId.', () => {
            const result = helper.getPreviousQuestionId('B');

            expect(result).toEqual('A');
        });
        it('Should return the task list state if the page Id is the first entry in the progress', () => {
            const result = helper.getPreviousQuestionId('A');

            expect(result).toEqual('p-task-list');
        });
        it('Should error if the page Id is not in the progress.', () => {
            expect(() => helper.getPreviousQuestionId('C')).toThrow(`Cannot go back to "C"`);
        });
        it('Should error if the progress is not in the context', () => {
            expect(() => helper.getPreviousQuestionId('J')).toThrow(
                `The task "4" has a malformed context. Missing: "Progress"`
            );
        });
        it('Should get the previous states pageId when no currentId is provided.', () => {
            const result = helper.getPreviousQuestionId();

            expect(result).toEqual('A');
        });
    });

    describe('getSystemAnswers', () => {
        const spec = {
            routes: {
                states: [
                    {
                        id: '1',
                        initial: 'A',
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        }
                    },
                    {
                        id: '2',
                        initial: 'D',
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        }
                    }
                ]
            },
            answers: {
                system: {
                    foo: 'bar'
                },
                owner: {
                    foo: 'bar'
                },
                origin: {
                    foo: 'bar'
                },
                '1': {
                    A: 'foobar'
                },
                '2': {
                    D: 'foobar'
                }
            }
        };
        const helper = createHelper(spec);
        it('Should extract the system answers from an answers object', () => {
            const expected = {
                system: {
                    foo: 'bar'
                },
                owner: {
                    foo: 'bar'
                },
                origin: {
                    foo: 'bar'
                }
            };
            const actual = helper.getSystemAnswers();

            expect(actual).toEqual(expected);
        });
    });

    describe('persistContext', () => {
        const spec = {
            routes: {
                states: [
                    {
                        id: '1',
                        initial: 'A',
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        }
                    },
                    {
                        id: '2',
                        initial: 'D',
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        }
                    }
                ]
            }
        };
        const helper = createHelper(spec);
        it('Should persist the context in each task', () => {
            const expected = {
                states: [
                    {
                        id: '1',
                        initial: 'A',
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        },
                        answers: {A: 'foobar', B: 'foobar'},
                        progress: ['A', 'B']
                    },
                    {
                        id: '2',
                        initial: 'D',
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        },
                        answers: {D: 'foobar', E: 'foobar', F: 'foobar'},
                        progress: ['D', 'E', 'F']
                    }
                ]
            };

            const actual = helper.persistContext();

            expect(actual).toEqual(expected);
        });
    });

    describe('getSharedProgress', () => {
        it('Should get the progress from each parallel machine', () => {
            const spec = {
                routes: {
                    states: [
                        {
                            id: '1',
                            initial: 'A',
                            states: {
                                A: {},
                                B: {},
                                C: {}
                            }
                        },
                        {
                            id: '2',
                            initial: 'D',
                            states: {
                                D: {},
                                E: {},
                                F: {}
                            }
                        }
                    ]
                }
            };
            const helper = createHelper(spec);
            const expected = ['A', 'B', 'D', 'E', 'F'];

            const actual = helper.getSharedProgress();

            expect(actual).toEqual(expected);
        });
    });

    describe('getSharedAnswers', () => {
        it('Should get the answers from each parallel machine', () => {
            const spec = {
                routes: {
                    states: [
                        {
                            id: '1',
                            initial: 'A',
                            states: {
                                A: {},
                                B: {},
                                C: {}
                            }
                        },
                        {
                            id: '2',
                            initial: 'D',
                            states: {
                                D: {},
                                E: {},
                                F: {}
                            }
                        }
                    ]
                }
            };
            const helper = createHelper(spec);
            const expected = {A: 'foobar', B: 'foobar', D: 'foobar', E: 'foobar', F: 'foobar'};

            const actual = helper.getSharedAnswers();

            expect(actual).toEqual(expected);
        });

        it('Should persist the system answers set externally', () => {
            const spec = {
                routes: {
                    states: [
                        {
                            id: '1',
                            initial: 'A',
                            states: {
                                A: {},
                                B: {},
                                C: {}
                            }
                        },
                        {
                            id: '2',
                            initial: 'D',
                            states: {
                                D: {},
                                E: {},
                                F: {}
                            }
                        }
                    ]
                },
                answers: {
                    system: 'foobar',
                    origin: 'web'
                }
            };
            const helper = createHelper(spec);
            const expected = {
                A: 'foobar',
                B: 'foobar',
                D: 'foobar',
                E: 'foobar',
                F: 'foobar',
                system: 'foobar',
                origin: 'web'
            };

            const actual = helper.getSharedAnswers();

            expect(actual).toEqual(expected);
        });
    });

    describe('setCurrent', () => {
        it('Should set the current question id to the value provided', () => {
            const spec = {
                routes: {
                    states: [
                        {
                            id: '1',
                            initial: 'A',
                            states: {
                                A: {},
                                B: {},
                                C: {}
                            }
                        },
                        {
                            id: '2',
                            initial: 'D',
                            states: {
                                D: {},
                                E: {},
                                F: {}
                            }
                        }
                    ]
                }
            };
            const helper = createHelper(spec);

            const actual = helper.setCurrent('B');

            expect(actual.id).toEqual('B');
        });
    });

    describe('first', () => {
        it('Should set the current question id to the initial state of the spec', () => {
            const spec = {
                routes: {
                    states: [
                        {
                            id: '1',
                            initial: 'A',
                            states: {
                                A: {},
                                B: {},
                                C: {}
                            }
                        },
                        {
                            id: '2',
                            initial: 'D',
                            states: {
                                D: {},
                                E: {},
                                F: {}
                            }
                        }
                    ]
                }
            };
            const helper = createHelper(spec);

            const actual = helper.first();

            expect(actual.id).toEqual('A');
        });
    });

    describe('next', () => {
        const spec = {
            routes: {
                states: [
                    {
                        id: '1',
                        initial: 'A',
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        }
                    },
                    {
                        id: '2',
                        initial: 'D',
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        }
                    }
                ]
            },
            taskStatuses: {
                '1': 'incomplete',
                '2': 'incomplete'
            }
        };
        const helper = createHelper(spec);
        it('Should return the next state of the machine the provided answer belongs to', () => {
            const actual = helper.next({A: 'foobar'}, 'A');

            expect(actual.id).toEqual('B');
        });
        it('Should error if the sectionId being answered is not available.', () => {
            expect(() => helper.next({C: 'foobar'}, 'C')).toThrow(`The state "C" is not available`);
        });
    });
});
