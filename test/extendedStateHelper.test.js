'use strict';

jest.doMock('q-expressions', () => {
    return {
        evaluate: jest.fn(cond => {
            return cond[1] === 'A';
        })
    };
});

const mockFirst = () => {
    return {id: 'some-id'};
};
jest.doMock('../lib/router', () => () => {
    return {
        first: mockFirst
    };
});

const createHelper = require('../lib/extendedStateHelper');

describe('extendedStateHelper tests', () => {
    describe('setupParallelMachines', () => {
        const spec = {
            routes: {
                states: {
                    '1': {
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        }
                    },
                    '2': {
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        }
                    }
                }
            }
        };
        const helper = createHelper(spec);
        it('Should get the task Id of which the question belongs to', () => {
            const expected = {
                currentSectionId: 'some-id',
                events: [],
                initial: '1',
                routes: {
                    states: {
                        '1': {
                            first: mockFirst
                        },
                        '2': {
                            first: mockFirst
                        }
                    }
                },
                taskStatuses: {
                    '1': 'incomplete',
                    '2': 'incomplete'
                }
            };
            const result = helper.setupParallelMachines();
            expect(result).toEqual(expected);
        });
    });

    describe('getTaskIdFromQuestionId', () => {
        const spec = {
            routes: {
                states: {
                    '1': {
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        }
                    },
                    '2': {
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        }
                    },
                    '3': {
                        states: {
                            G: {},
                            H: {},
                            I: {}
                        }
                    }
                }
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
        const router = {
            routes: {
                states: {
                    '1': {
                        last: () => {
                            return {context: 'foo'};
                        }
                    },
                    '2': {
                        last: () => {
                            return {context: 'bar'};
                        }
                    },
                    '3': {
                        last: () => {
                            return {context: 'baz'};
                        }
                    }
                }
            }
        };
        const helper = createHelper({});
        it('Should get context of the specified task', () => {
            const result = helper.getTaskContext(router, '1');
            const result2 = helper.getTaskContext(router, '2');
            const result3 = helper.getTaskContext(router, '3');
            expect(result).toEqual('foo');
            expect(result2).toEqual('bar');
            expect(result3).toEqual('baz');
        });
        it('Should throw is task is undefined', () => {
            expect(() => helper.getTaskContext(router, undefined)).toThrow(
                'The task "undefined" does not exist'
            );
        });
        it('Should throw is task is not found', () => {
            expect(() => helper.getTaskContext(router, '5')).toThrow('The task "5" does not exist');
        });
    });

    describe('getNotApplicableTasks', () => {
        const spec = {
            routes: {
                guards: {
                    '1': {
                        cond: ['==', 'A', 'A']
                    },
                    '2': {
                        cond: ['==', 'B', 'A']
                    }
                }
            }
        };
        const helper = createHelper(spec);
        it('Should evaluate the guards object and return an array of tasks whose guard evaluates to false', () => {
            const result = helper.getNotApplicableTasks({});
            expect(result).toEqual(['2']);
        });
    });

    describe('isAvailable', () => {
        const spec = {
            routes: {
                states: {
                    '1': {
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        }
                    },
                    '2': {
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        }
                    },
                    '3': {
                        states: {
                            G: {},
                            H: {},
                            I: {}
                        }
                    }
                }
            }
        };
        const router = {
            routes: {
                states: {
                    '1': {
                        last: () => {
                            return {
                                context: {
                                    progress: ['A']
                                }
                            };
                        }
                    },
                    '2': {
                        last: () => {
                            return {
                                context: {
                                    progress: ['D']
                                }
                            };
                        }
                    },
                    '3': {
                        last: () => {
                            return {
                                context: {
                                    progress: []
                                }
                            };
                        }
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
            const result = helper.isAvailable({}, undefined);
            expect(result).toEqual(false);
        });
        it('Should return true for "p-task-list"', () => {
            const result = helper.isAvailable({}, 'p-task-list');
            expect(result).toEqual(true);
        });
        it('Should return true if it finds the target in  a machines progress', () => {
            const result = helper.isAvailable(router, 'A');
            expect(result).toEqual(true);
        });
        it('Should return false if it does not find the target in a machines progress', () => {
            const result = helper.isAvailable(router, 'G');
            expect(result).toEqual(false);
        });
        it("Should return false if the target's task is 'notApplicable'", () => {
            const result = helper.isAvailable(router, 'D');
            expect(result).toEqual(false);
        });
    });

    describe('getPreviousQuestionId', () => {
        const spec = {
            routes: {
                states: {
                    '1': {
                        states: {
                            A: {},
                            B: {},
                            C: {}
                        }
                    },
                    '2': {
                        states: {
                            D: {},
                            E: {},
                            F: {}
                        }
                    },
                    '3': {
                        states: {
                            G: {},
                            H: {},
                            I: {}
                        }
                    },
                    '4': {
                        states: {
                            J: {},
                            K: {},
                            L: {}
                        }
                    }
                }
            }
        };
        const router = {
            routes: {
                states: {
                    '1': {
                        last: () => {
                            return {
                                context: {
                                    progress: ['A', 'B', 'C']
                                }
                            };
                        }
                    },
                    '2': {
                        last: () => {
                            return {
                                context: {
                                    progress: ['D']
                                }
                            };
                        }
                    },
                    '3': {
                        last: () => {
                            return {
                                context: {
                                    progress: ['G', 'H']
                                }
                            };
                        }
                    },
                    '4': {
                        last: () => {
                            return {
                                context: {}
                            };
                        }
                    }
                }
            }
        };
        const helper = createHelper(spec);
        it('Should get the previous states pageId.', () => {
            const result = helper.getPreviousQuestionId(router, 'B');

            expect(result).toEqual('A');
        });
        it('Should return the task list state if the page Id is the first entry in the progress', () => {
            const result = helper.getPreviousQuestionId(router, 'D');

            expect(result).toEqual('p-task-list');
        });
        it('Should error if the page Id is not in the progress.', () => {
            expect(() => helper.getPreviousQuestionId(router, 'I')).toThrow(
                `Cannot go back to "I"`
            );
        });
        it('Should error if the progress is not in the context', () => {
            expect(() => helper.getPreviousQuestionId(router, 'L')).toThrow(
                `The task "4" has a malformed context. Missing: "Progress"`
            );
        });
    });

    describe('propagateCascade', () => {
        const event = {type: 'cascade', value: 'B', origin: '1'};
        const helper = createHelper({});
        it('Should perform a cascade and clear from origin task machine', () => {
            const router = {
                routes: {
                    states: {
                        '1': {
                            clearCascadeEvent: jest.fn()
                        },
                        '2': {
                            externalCascade: jest.fn()
                        }
                    }
                }
            };
            helper.propagateCascade(router, event);

            expect(router.routes.states['1'].clearCascadeEvent).toHaveBeenCalledTimes(1);
            expect(router.routes.states['1'].clearCascadeEvent).toHaveBeenCalledWith(event);
            expect(router.routes.states['2'].externalCascade).toHaveBeenCalledTimes(1);
        });
        it('Should perform a cascade across all tasks except the origin', () => {
            const router = {
                routes: {
                    states: {
                        '1': {
                            externalCascade: jest.fn(),
                            clearCascadeEvent: jest.fn()
                        },
                        '2': {
                            externalCascade: jest.fn()
                        },
                        '3': {
                            externalCascade: jest.fn()
                        },
                        '4': {
                            externalCascade: jest.fn()
                        },
                        '5': {
                            externalCascade: jest.fn()
                        },
                        '6': {
                            externalCascade: jest.fn()
                        }
                    }
                }
            };
            helper.propagateCascade(router, event);

            expect(router.routes.states['1'].externalCascade).not.toHaveBeenCalled();
            expect(router.routes.states['2'].externalCascade).toHaveBeenCalledTimes(1);
            expect(router.routes.states['3'].externalCascade).toHaveBeenCalledTimes(1);
            expect(router.routes.states['4'].externalCascade).toHaveBeenCalledTimes(1);
            expect(router.routes.states['5'].externalCascade).toHaveBeenCalledTimes(1);
            expect(router.routes.states['6'].externalCascade).toHaveBeenCalledTimes(1);
        });
    });
});
