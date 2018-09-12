const qRouter = require('../index.js');

describe('qRouter', () => {
    it('should start at the specified section', () => {
        const router = qRouter({
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: 'section2'
                        }
                    },
                    section2: {
                        on: {
                            ANSWER: 'section3'
                        }
                    },
                    section3: {}
                }
            }
        });

        expect(router.getCurrentState().value).toEqual('section1');
    });

    it('should store a supplied value against the current state', () => {
        const router = qRouter({
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: 'section2'
                        }
                    },
                    section2: {
                        on: {
                            ANSWER: 'section3'
                        }
                    },
                    section3: {}
                }
            }
        });

        router.next('ANSWER', {
            'section1/q1': 'value of answer'
        });

        expect(router.extendedState).toEqual({
            section1: {
                'section1/q1': {value: 'value of answer'}
            }
        });
    });

    it('should store multiple supplied values against the current state', () => {
        const router = qRouter({
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: 'section2'
                        }
                    },
                    section2: {
                        on: {
                            ANSWER: 'section3'
                        }
                    },
                    section3: {}
                }
            }
        });

        router.next('ANSWER', {
            'section1/q1': 'value of answer 1',
            'section1/q2': 'value of answer 2'
        });

        expect(router.extendedState).toEqual({
            section1: {
                'section1/q1': {value: 'value of answer 1'},
                'section1/q2': {value: 'value of answer 2'}
            }
        });
    });

    it('should move to the next section according to the routing rules', () => {
        const router = qRouter({
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: 'section2'
                        }
                    },
                    section2: {
                        on: {
                            ANSWER: 'section3'
                        }
                    },
                    section3: {}
                }
            }
        });

        router.next('ANSWER');

        expect(router.getCurrentState().value).toEqual('section2');
    });

    it('should track the routing history', () => {
        const router = qRouter({
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: 'section2'
                        }
                    },
                    section2: {
                        on: {
                            ANSWER: 'section3'
                        }
                    },
                    section3: {}
                }
            }
        });

        router.next('ANSWER');
        router.next('ANSWER');
        router.next('ANSWER');

        expect(router.history).toEqual(['section1', 'section2', 'section3']);
    });

    it('should move to the previous state according to the history', () => {
        const router = qRouter({
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: 'section2'
                        }
                    },
                    section2: {
                        on: {
                            ANSWER: 'section3'
                        }
                    },
                    section3: {}
                }
            }
        });

        router.next('ANSWER');
        router.next('ANSWER');
        router.previous();

        expect(router.getCurrentState().value).toEqual('section2');
    });

    it('should move to the next section based on any conditions', () => {
        const router = qRouter({
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: [
                                {target: 'section3', cond: ['==', 1, 2]},
                                {target: 'section2', cond: ['==', 2, 2]},
                                {target: 'section4', cond: ['==', 3, 2]}
                            ]
                        }
                    },
                    section2: {
                        on: {
                            ANSWER: [
                                {target: 'section4', cond: ['==', 2, 2]},
                                {target: 'section3', cond: ['==', 1, 2]}
                            ]
                        }
                    },
                    section3: {
                        on: {
                            ANSWER: 'section4'
                        }
                    },
                    section4: {}
                }
            }
        });

        router.next('ANSWER');
        router.next('ANSWER');

        expect(router.getCurrentState().value).toEqual('section4');
    });

    it('should assume the condition is true if the "cond" attribute is omitted', () => {
        const router = qRouter({
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: [{target: 'section3', cond: ['==', 1, 2]}, {target: 'section2'}]
                        }
                    },
                    section2: {},
                    section3: {}
                }
            }
        });

        router.next('ANSWER');

        expect(router.getCurrentState().value).toEqual('section2');
    });

    it('should be able to use previous answers as data in conditions', () => {
        const router = qRouter({
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: [
                                {target: 'section3', cond: ['==', '$section1.q1.value', 2]},
                                {target: 'section2'}
                            ]
                        }
                    },
                    section2: {},
                    section3: {}
                }
            }
        });

        router.next('ANSWER', {
            'q1': 2
        });

        expect(router.getCurrentState().value).toEqual('section3');
    });

    it('should be able to use previous answers as data in conditions', () => {
        const router = qRouter({
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: [
                                {target: 'section3', cond: ['==', '$section1.q1.value', 2]},
                                {target: 'section2'}
                            ]
                        }
                    },
                    section2: {},
                    section3: {}
                }
            }
        });

        router.next('ANSWER', {
            'q1': 2
        });

        expect(router.getCurrentState().value).toEqual('section3');
    });
});
