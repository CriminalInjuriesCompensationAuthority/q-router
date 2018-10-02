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
            sections: {
                section1: {}
            },
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
            q1: 'value of answer'
        });

        expect(router.extendedState.answers).toEqual({
            section1: {
                q1: {value: 'value of answer'}
            }
        });
    });

    it('should store a supplied value with multiple keys against the current state', () => {
        const router = qRouter({
            sections: {
                section1: {}
            },
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
            q1: 'value of answer 1',
            q2: 'value of answer 2'
        });

        expect(router.extendedState.answers).toEqual({
            section1: {
                q1: {value: 'value of answer 1'},
                q2: {value: 'value of answer 2'}
            }
        });
    });

    it('should overwrite the previous answer when the question is edited', () => {
        const router = qRouter({
            sections: {
                section1: {}
            },
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

        // answer questions
        router.next('ANSWER', {
            q1: 'value of answer 1',
            q2: 'value of answer 2'
        });

        // go back to question
        router.previous();

        // edit question
        router.next('ANSWER', {
            q1: 'value of answer 1 edited',
            q2: 'value of answer 2 edited'
        });

        expect(router.extendedState.answers).toEqual({
            section1: {
                q1: {value: 'value of answer 1 edited'},
                q2: {value: 'value of answer 2 edited'}
            }
        });
    });

    describe('Repeatable sections', () => {
        let questionnaire;

        beforeEach(() => {
            questionnaire = {
                sections: {
                    'p-number-of-attackers': {
                        $schema: 'http://json-schema.org/draft-06/schema#',
                        $id: '#number-of-attackers',
                        title: 'Number of attackers',
                        type: 'object',
                        properties: {
                            'q-number-of-attackers': {
                                title: 'How many attackers were involved in the incident?',
                                type: 'number'
                            }
                        }
                    },
                    'p-attacker-names': {
                        $schema: 'http://json-schema.org/draft-06/schema#',
                        $id: '#attacker-names',
                        title: 'Enter their name',
                        type: 'object',
                        required: ['q-attacker-first-name', 'q-attacker-last-name'],
                        'additional-properties': false,
                        'x-repeatable': true,
                        properties: {
                            'q-attacker-first-name': {
                                title: 'First name',
                                type: 'string'
                            },
                            'q-attacker-last-name': {
                                title: 'Last name',
                                type: 'string'
                            }
                        }
                    },
                    section3: {}
                },
                routes: {
                    initial: 'p-number-of-attackers',
                    states: {
                        'p-number-of-attackers': {
                            on: {
                                ANSWER: 'p-attacker-names'
                            }
                        },
                        'p-attacker-names': {
                            on: {
                                ANSWER: [
                                    {
                                        target: 'p-attacker-names',
                                        cond: [
                                            'answeredLessThan',
                                            'p-attacker-names',
                                            'q-number-of-attackers'
                                        ]
                                    },
                                    {
                                        target: 'section3'
                                    }
                                ]
                            }
                        },
                        section3: {}
                    }
                }
            };
        });

        it('should allow a page to be repeated', () => {
            const router = qRouter(questionnaire);

            // answer questions
            router.next('ANSWER', {'q-number-of-attackers': 2});
            router.next('ANSWER', {
                'q-attacker-first-name': 'Peppa',
                'q-attacker-last-name': 'Pig'
            });
            router.next('ANSWER', {
                'q-attacker-first-name': 'Rebecca',
                'q-attacker-last-name': 'Rabbit'
            });
            router.next('ANSWER', {bla: 3});

            expect(router.extendedState.answers).toEqual({
                'p-number-of-attackers': {
                    'q-number-of-attackers': {value: 2}
                },
                'p-attacker-names': [
                    {
                        'q-attacker-first-name': {value: 'Peppa'},
                        'q-attacker-last-name': {value: 'Pig'}
                    },
                    {
                        'q-attacker-first-name': {value: 'Rebecca'},
                        'q-attacker-last-name': {value: 'Rabbit'}
                    }
                ],
                section3: {
                    bla: {value: 3}
                }
            });
        });

        it('should allow multiple pages to be repeated', () => {
            const router = qRouter({
                sections: {
                    a: {},
                    b: {},
                    c: {'x-repeatable': true},
                    d: {'x-repeatable': true},
                    e: {'x-repeatable': true},
                    f: {},
                    g: {}
                },
                routes: {
                    initial: 'a',
                    states: {
                        a: {
                            on: {
                                ANSWER: 'b'
                            }
                        },
                        b: {
                            on: {
                                ANSWER: 'c'
                            }
                        },
                        c: {
                            on: {
                                ANSWER: 'd'
                            }
                        },
                        d: {
                            on: {
                                ANSWER: 'e'
                            }
                        },
                        e: {
                            on: {
                                ANSWER: [
                                    {
                                        target: 'c',
                                        cond: ['answeredLessThan', 'c', 3]
                                    },
                                    {
                                        target: 'f'
                                    }
                                ]
                            }
                        },
                        f: {
                            on: {
                                ANSWER: 'g'
                            }
                        },
                        g: {}
                    }
                }
            });

            // answer questions
            router.next('ANSWER', {'question-a': 1}); // a
            router.next('ANSWER', {'question-b': 1}); // b
            router.next('ANSWER', {'question-c': 1}); // c
            router.next('ANSWER', {'question-d': 1}); // d
            router.next('ANSWER', {'question-e': 1}); // e
            router.next('ANSWER', {'question-c': 2}); // c2
            router.next('ANSWER', {'question-d': 2}); // d2
            router.next('ANSWER', {'question-e': 2}); // e2
            router.next('ANSWER', {'question-c': 3}); // c3
            router.next('ANSWER', {'question-d': 3}); // d3
            router.next('ANSWER', {'question-e': 3}); // e3
            router.next('ANSWER', {'question-f': 1}); // f
            router.next('ANSWER', {'question-g': 1}); // g

            expect(router.extendedState.answers).toEqual({
                a: {'question-a': {value: 1}},
                b: {'question-b': {value: 1}},
                c: [
                    {'question-c': {value: 1}},
                    {'question-c': {value: 2}},
                    {'question-c': {value: 3}}
                ],
                d: [
                    {'question-d': {value: 1}},
                    {'question-d': {value: 2}},
                    {'question-d': {value: 3}}
                ],
                e: [
                    {'question-e': {value: 1}},
                    {'question-e': {value: 2}},
                    {'question-e': {value: 3}}
                ],
                f: {'question-f': {value: 1}},
                g: {'question-g': {value: 1}}
            });
        });

        it('should overwrite the previous answer when the question is edited', () => {
            const router = qRouter(questionnaire);

            // answer questions
            router.next('ANSWER', {'q-number-of-attackers': 4});
            router.next('ANSWER', {
                'q-attacker-first-name': 'Peppa',
                'q-attacker-last-name': 'Pig'
            });
            router.next('ANSWER', {
                'q-attacker-first-name': 'Rebecca',
                'q-attacker-last-name': 'Rabbit'
            });
            router.next('ANSWER', {
                'q-attacker-first-name': 'Suzie',
                'q-attacker-last-name': 'Sheep'
            });
            router.next('ANSWER', {
                'q-attacker-first-name': 'Mummy',
                'q-attacker-last-name': 'Pig'
            });
            router.next('ANSWER', {bla: 3});

            // go back to question
            router.previous();
            router.previous();
            router.previous();
            router.previous(); // rebecca rabbit above

            // edit question
            router.next('ANSWER', {
                'q-attacker-first-name': 'Candy',
                'q-attacker-last-name': 'Cat'
            });

            expect(router.extendedState.answers).toEqual({
                'p-number-of-attackers': {
                    'q-number-of-attackers': {value: 4}
                },
                'p-attacker-names': [
                    {
                        'q-attacker-first-name': {value: 'Peppa'},
                        'q-attacker-last-name': {value: 'Pig'}
                    },
                    {
                        'q-attacker-first-name': {value: 'Candy'},
                        'q-attacker-last-name': {value: 'Cat'}
                    },
                    {
                        'q-attacker-first-name': {value: 'Suzie'},
                        'q-attacker-last-name': {value: 'Sheep'}
                    },
                    {
                        'q-attacker-first-name': {value: 'Mummy'},
                        'q-attacker-last-name': {value: 'Pig'}
                    }
                ],
                section3: {
                    bla: {value: 3}
                }
            });
        });
    });

    it('should move to the next section according to the routing rules', () => {
        const router = qRouter({
            sections: {
                section1: {}
            },
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
            sections: {
                section1: {},
                section2: {},
                section3: {}
            },
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
            sections: {
                section1: {},
                section2: {},
                section3: {}
            },
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
            sections: {
                section1: {},
                section2: {},
                section3: {}
            },
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
            sections: {
                section1: {},
                section2: {},
                section3: {}
            },
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
            sections: {
                section1: {},
                section2: {},
                section3: {}
            },
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: [
                                {target: 'section3', cond: ['==', '$.section1.q1.value', 2]},
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
            q1: 2
        });

        expect(router.getCurrentState().value).toEqual('section3');
    });
});
