const qRouter = require('../index.js');

describe('qRouter', () => {
    let questionnaire;

    beforeEach(() => {
        questionnaire = {
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
                    d: {}
                }
            }
        };
    });

    it('should start at the specified section', () => {
        const router = qRouter(questionnaire);

        expect(router.current()).toEqual('a');
    });

    it('should store a supplied value against the current state', () => {
        const router = qRouter(questionnaire);

        router.next('ANSWER', {
            q1: 'value of answer'
        });

        expect(router.questionnaire.answers).toEqual({
            a: {
                q1: {value: 'value of answer'}
            }
        });
    });

    it('should store a supplied value with multiple keys against the current state', () => {
        const router = qRouter(questionnaire);

        router.next('ANSWER', {
            q1: 'value of answer 1',
            q2: 'value of answer 2'
        });

        expect(router.questionnaire.answers).toEqual({
            a: {
                q1: {value: 'value of answer 1'},
                q2: {value: 'value of answer 2'}
            }
        });
    });

    it('should overwrite the previous answer when the question is edited', () => {
        const router = qRouter(questionnaire);

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

        expect(router.questionnaire.answers).toEqual({
            a: {
                q1: {value: 'value of answer 1 edited'},
                q2: {value: 'value of answer 2 edited'}
            }
        });
    });

    describe('Repeatable sections', () => {
        let questionnaireWithRepeatableSections;

        beforeEach(() => {
            questionnaireWithRepeatableSections = {
                routes: {
                    initial: 'p-number-of-attackers',
                    states: {
                        'p-number-of-attackers': {
                            on: {
                                ANSWER: 'p-attacker-names'
                            }
                        },
                        'p-attacker-names': {
                            repeatable: true,
                            on: {
                                ANSWER: [
                                    {
                                        target: 'p-attacker-names',
                                        // This will repeat the enter attacker name question, based on the answer given to how many attackers were involved
                                        // e.g. 3 attackers, for each attacker enter their name
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
            const router = qRouter(questionnaireWithRepeatableSections);

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

            expect(router.questionnaire.answers).toEqual({
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

        it('should be able to start with a self referencing repeatable section', () => {
            const router = qRouter({
                routes: {
                    initial: 'a',
                    states: {
                        a: {
                            repeatable: true,
                            on: {
                                ANSWER: [
                                    {
                                        target: 'a',
                                        cond: ['answeredLessThan', 'a', 3]
                                    },
                                    {
                                        target: 'b'
                                    }
                                ]
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
                        d: {}
                    }
                }
            });

            router.next('ANSWER', {aQ1: 1});
            router.next('ANSWER', {aQ2: 2});
            router.next('ANSWER', {aQ3: 3});
            router.next('ANSWER', {bQ1: 4});
            router.next('ANSWER', {cQ1: 5});

            expect(router.progress).toEqual(['a', 'a/2', 'a/3', 'b', 'c']);
            expect(router.questionnaire.answers).toEqual({
                a: [{aQ1: {value: 1}}, {aQ2: {value: 2}}, {aQ3: {value: 3}}],
                b: {bQ1: {value: 4}},
                c: {cQ1: {value: 5}}
            });
        });

        it('should be able to start with a multi section repeatable', () => {
            const router = qRouter({
                routes: {
                    initial: 'a',
                    states: {
                        a: {
                            repeatable: true,
                            on: {
                                ANSWER: 'b'
                            }
                        },
                        b: {
                            repeatable: true,
                            on: {
                                ANSWER: 'c'
                            }
                        },
                        c: {
                            repeatable: true,
                            on: {
                                ANSWER: [
                                    {
                                        target: 'a',
                                        cond: ['answeredLessThan', 'c', 3]
                                    },
                                    {
                                        target: 'd'
                                    }
                                ]
                            }
                        },
                        d: {}
                    }
                }
            });

            router.next('ANSWER', {aQ1: 1});
            router.next('ANSWER', {bQ1: 2});
            router.next('ANSWER', {cQ1: 3});
            router.next('ANSWER', {aQ1: 4});
            router.next('ANSWER', {bQ1: 5});
            router.next('ANSWER', {cQ1: 6});
            router.next('ANSWER', {aQ1: 7});
            router.next('ANSWER', {bQ1: 8});
            router.next('ANSWER', {cQ1: 9});

            expect(router.progress).toEqual([
                'a',
                'b',
                'c',
                'a/2',
                'b/2',
                'c/2',
                'a/3',
                'b/3',
                'c/3'
            ]);
            expect(router.questionnaire.answers).toEqual({
                a: [{aQ1: {value: 1}}, {aQ1: {value: 4}}, {aQ1: {value: 7}}],
                b: [{bQ1: {value: 2}}, {bQ1: {value: 5}}, {bQ1: {value: 8}}],
                c: [{cQ1: {value: 3}}, {cQ1: {value: 6}}, {cQ1: {value: 9}}]
            });
        });

        it('should return a sectionId that contains the array index of the stored answer', () => {
            const router = qRouter(questionnaireWithRepeatableSections);
            const expectedSectionIds = [];

            // answer questions
            expectedSectionIds.push(router.current());
            router.next('ANSWER', {'q-number-of-attackers': 3});

            expectedSectionIds.push(router.current());
            router.next('ANSWER', {
                'q-attacker-first-name': 'Peppa1',
                'q-attacker-last-name': 'Pig1'
            });

            expectedSectionIds.push(router.current());
            router.next('ANSWER', {
                'q-attacker-first-name': 'Peppa2',
                'q-attacker-last-name': 'Pig2'
            });

            expectedSectionIds.push(router.current());
            router.next('ANSWER', {
                'q-attacker-first-name': 'Peppa3',
                'q-attacker-last-name': 'Pig3'
            });

            expectedSectionIds.push(router.current());

            expect(expectedSectionIds).toEqual([
                'p-number-of-attackers',
                'p-attacker-names',
                'p-attacker-names/2',
                'p-attacker-names/3',
                'section3'
            ]);
            expect(router.progress).toEqual([
                'p-number-of-attackers',
                'p-attacker-names',
                'p-attacker-names/2',
                'p-attacker-names/3'
            ]);
        });

        it('should overwrite the previous answer when the question is edited', () => {
            const router = qRouter(questionnaireWithRepeatableSections);

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
            router.previous(); // bla 3
            router.previous(); // Mummy Pig
            router.previous(); // Suzie Sheep
            router.previous(); // Rebecca Rabbit

            // edit question Rebecca Rabbit to Candy Cat
            router.next('ANSWER', {
                'q-attacker-first-name': 'Candy',
                'q-attacker-last-name': 'Cat'
            });

            expect(router.questionnaire.answers).toEqual({
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

        it('should allow multiple pages to be repeated', () => {
            const router = qRouter({
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
                            repeatable: true,
                            on: {
                                ANSWER: 'd'
                            }
                        },
                        d: {
                            repeatable: true,
                            on: {
                                ANSWER: 'e'
                            }
                        },
                        e: {
                            repeatable: true,
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

            expect(router.questionnaire.answers).toEqual({
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
    });

    it('should move to the next section according to the routing rules', () => {
        const router = qRouter(questionnaire);

        router.next('ANSWER');

        expect(router.current()).toEqual('b');
    });

    it('should track the routing progress', () => {
        const router = qRouter(questionnaire);

        router.next('ANSWER');
        router.next('ANSWER');
        router.next('ANSWER');

        expect(router.progress).toEqual(['a', 'b', 'c']);
    });

    it('should move to the previous state according to the progress', () => {
        const router = qRouter(questionnaire);

        router.next('ANSWER');
        router.next('ANSWER');
        router.previous();

        expect(router.current()).toEqual('b');
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

        expect(router.current()).toEqual('section4');
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

        expect(router.current()).toEqual('section2');
    });

    it('should be able to use previous answers as data in conditions', () => {
        const router = qRouter({
            routes: {
                initial: 'section1',
                states: {
                    section1: {
                        on: {
                            ANSWER: [
                                {
                                    target: 'section3',
                                    cond: ['==', '$.answers.section1.q1.value', 2]
                                },
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

        expect(router.current()).toEqual('section3');
    });

    it('should use the current progress as the initial state if available', () => {
        questionnaire.progress = ['a', 'b', 'c'];

        const router = qRouter(questionnaire);

        expect(router.current()).toEqual('c');
    });

    describe('Progress management', () => {
        describe('Given the following saved progress ["a", "b", "c", "d"]', () => {
            it('should remove any saved progress sectionIds after the current sectionId', () => {
                const router = qRouter(questionnaire);

                router.next('ANSWER', {'q-a': 1}, 'a');
                router.next('ANSWER', {'q-b': 1}, 'b');
                router.next('ANSWER', {'q-c': 1}, 'c');
                router.next('ANSWER', {'q-d': 1}, 'd');
                router.next('ANSWER', {'q-a': 2}, 'a');

                expect(router.progress).toEqual(['a']);
            });
        });
    });

    it('should return the next section id from the "next" method', () => {
        const router = qRouter(questionnaire);
        const nextSectionId = router.next('ANSWER', {aQ1: true});

        expect(nextSectionId).toEqual('b');
    });

    it('should return the previous section id from the "previous" method', () => {
        const router = qRouter(questionnaire);

        router.next('ANSWER', {aQ1: true});
        router.next('ANSWER', {bQ1: true});
        router.next('ANSWER', {cQ1: true});

        const previousSectionId = router.previous();

        expect(previousSectionId).toEqual('c');
    });
});
