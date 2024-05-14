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
describe('qRouter tests', () => {
    describe('q router', () => {
        it('should start at the initial route', () => {
            const router = createQRouter({
                routes: {
                    initial: 'a',
                    states: {
                        a: {
                            type: 'final'
                        }
                    }
                }
            });

            const section = router.current();

            expect(section.id).toEqual('a');
            expect(section.context.progress).toEqual(['a']);
        });

        it('should restart at the last saved state', () => {
            let section;
            const router = createQRouter({
                currentSection: 'a',
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
                            type: 'final'
                        }
                    }
                }
            });

            router.next({
                q1: 'answer a'
            });
            router.next({
                q1: 'answer b'
            });
            router.next({
                q1: 'answer c'
            });
            router.next({
                q1: 'answer d'
            });
            // ^^ current section id now at 'e'

            section = router.previous();
            section = router.previous();
            // ^^ current section id now at 'c'

            expect(section.id).toEqual('c');
            expect(section.context.progress).toEqual(['a', 'b', 'c', 'd', 'e']);

            // Create a new router from the previous router's context and things should be the same
            const router2 = createQRouter(section.context);

            section = router2.current();

            expect(section.id).toEqual('c');
            expect(section.context.progress).toEqual(['a', 'b', 'c', 'd', 'e']);
        });

        describe('Next', () => {
            it('should move to the next route', () => {
                const router = createQRouter({
                    routes: {
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
                    }
                });

                const section = router.next();

                expect(section.id).toEqual('b');
                expect(section.context.progress).toEqual(['a', 'b']);
            });

            it('should throw if next() is called on a section of type "final"', () => {
                const router = createQRouter({
                    routes: {
                        initial: 'a',
                        states: {
                            a: {
                                type: 'final'
                            }
                        }
                    }
                });

                const rxExpectedError = errorMessageToRegExp(
                    `There are no next sections after section: "a"`
                );

                expect(() => router.next()).toThrow(rxExpectedError);
            });

            it('should return undefined if next attempts to advance to a section that has not been visited', () => {
                const router = createQRouter({
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
                                type: 'final'
                            }
                        }
                    }
                });

                const section = router.next(null, 'b');

                expect(section).toEqual(undefined);
            });

            describe('Answers', () => {
                it('should initialise with "APP_ENV" value in the answers', () => {
                    const router = createQRouter({
                        routes: {
                            initial: 'a',
                            states: {
                                a: {
                                    type: 'final'
                                }
                            }
                        }
                    });

                    const section = router.current();
                    expect(section.context.answers.system.env).toEqual('test');
                });

                it('should persist "env" within the answers.system property', () => {
                    const router = createQRouter({
                        routes: {
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
                        }
                    });

                    const section = router.next({
                        q1: 'answer'
                    });

                    expect(section.context.answers).toEqual({
                        a: {
                            q1: 'answer'
                        },
                        system: {
                            env: 'test'
                        }
                    });
                });

                it('should store a supplied value against the current state', () => {
                    const router = createQRouter({
                        routes: {
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
                        }
                    });

                    const section = router.next({
                        q1: 'answer'
                    });

                    expect(section.context.answers).toHaveProperty('a');
                    expect(section.context.answers.a).toEqual({
                        q1: 'answer'
                    });
                });

                it('should overwrite the previous answer when using previous() to navigate', () => {
                    const router = createQRouter({
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
                                    type: 'final'
                                }
                            }
                        }
                    });

                    router.next({
                        q1: 'answer a'
                    });
                    router.next({
                        q1: 'answer b'
                    });
                    router.previous();
                    const section = router.next({
                        q1: 'edited answer b'
                    });

                    expect(section.context.answers).toHaveProperty('a');
                    expect(section.context.answers.a).toEqual({
                        q1: 'answer a'
                    });

                    expect(section.context.answers).toHaveProperty('b');
                    expect(section.context.answers.b).toEqual({
                        q1: 'edited answer b'
                    });
                });

                it('should overwrite a specified answer when a section id is supplied', () => {
                    const router = createQRouter({
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
                                    type: 'final'
                                }
                            }
                        }
                    });

                    router.next({
                        q1: 'answer a'
                    });
                    router.next({
                        q1: 'answer b'
                    });

                    // Answer for section 'b' will be edited
                    const section = router.next(
                        {
                            q1: 'edited answer b'
                        },
                        'b'
                    );

                    expect(section.context.answers).toHaveProperty('a');
                    expect(section.context.answers.a).toEqual({
                        q1: 'answer a'
                    });

                    expect(section.context.answers).toHaveProperty('b');
                    expect(section.context.answers.b).toEqual({
                        q1: 'edited answer b'
                    });
                });

                it('should only use answers that are on pages in progress', () => {
                    // for more details around this test - https://github.com/CriminalInjuriesCompensationAuthority/q-router/issues/16
                    const router = createQRouter({
                        routes: {
                            initial: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'b',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: ['==', '$.answers.a.q1', 'foo']
                                                    }
                                                }
                                            },
                                            {
                                                target: 'c',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: ['==', '$.answers.a.q1', 'bar']
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                },
                                b: {
                                    on: {
                                        ANSWER: [{target: 'd'}]
                                    }
                                },
                                c: {
                                    on: {
                                        ANSWER: [{target: 'd'}]
                                    }
                                },
                                d: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'e',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: ['==', '$.answers.b.q1', 1]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'f',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: ['==', '$.answers.c.q1', 1]
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                },
                                e: {type: 'final'},
                                f: {type: 'final'}
                            }
                        }
                    });

                    // current is a
                    router.next({q1: 'foo'}); // a's answer, goto b
                    router.next({q1: 1}); // b's answer, goto d
                    router.previous(); // backtrack to b
                    router.previous(); // backtrack to a
                    router.next({q1: 'bar'}); // a's answer, goto c
                    router.next({q1: 1}); // c's answer, goto d
                    router.next({q1: 1}); // d's answer, goto f

                    const current = router.current();

                    expect(current.id).toEqual('f');
                });

                describe('Restore answers', () => {
                    it('should restore any retracted answers for a section added to progress', () => {
                        const router = createQRouter({
                            routes: {
                                initial: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'b',
                                                    guard: {
                                                        type: 'evaluateRoute',
                                                        params: {
                                                            cond: ['==', '$.answers.a.q1', 'foo']
                                                        }
                                                    }
                                                },
                                                {
                                                    target: 'c',
                                                    guard: {
                                                        type: 'evaluateRoute',
                                                        params: {
                                                            cond: ['==', '$.answers.a.q1', 'bar']
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER: [{target: 'd'}]
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER: [{target: 'd'}]
                                        }
                                    },
                                    d: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'e',
                                                    guard: {
                                                        type: 'evaluateRoute',
                                                        params: {
                                                            cond: ['==', '$.answers.b.q1', 1]
                                                        }
                                                    }
                                                },
                                                {
                                                    target: 'f',
                                                    guard: {
                                                        type: 'evaluateRoute',
                                                        params: {
                                                            cond: ['==', '$.answers.c.q1', 1]
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    e: {type: 'final'},
                                    f: {type: 'final'}
                                }
                            }
                        });

                        // current is a
                        router.next({q1: 'foo'}); // a's answer, goto b
                        router.next({q1: 1}); // b's answer, goto d

                        router.previous(); // backtrack to b
                        router.previous(); // backtrack to a

                        router.next({q1: 'bar'}); // a's answer, goto c
                        router.next({q1: 1}); // c's answer, goto d

                        router.previous(); // backtrack to c
                        router.previous(); // backtrack to a

                        router.next({q1: 'foo'}); // a's answer, goto b - should restore b's previous answer

                        const questionnaire = router.current().context;

                        expect(questionnaire.answers).toHaveProperty('a');
                        expect(questionnaire.answers.a).toEqual({
                            q1: 'foo'
                        });

                        expect(questionnaire.answers).toHaveProperty('b');
                        expect(questionnaire.answers.b).toEqual({
                            q1: 1
                        });

                        expect(questionnaire.retractedAnswers).toEqual({
                            c: {
                                q1: 1
                            }
                        });
                    });
                });

                describe('Cascade: updating answer removes subsequent progress', () => {
                    describe('Section relies on its own answer for routing', () => {
                        it('should clear affected progress', () => {
                            const router = createQRouter({
                                routes: {
                                    initial: 'a',
                                    states: {
                                        a: {
                                            on: {
                                                ANSWER: [
                                                    {
                                                        target: 'b',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.a.q1',
                                                                    'scotland'
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'c',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.a.q1',
                                                                    'england'
                                                                ]
                                                            }
                                                        }
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
                                            type: 'final'
                                        }
                                    }
                                }
                            });

                            router.next({q1: 'scotland'});
                            router.next();
                            const section = router.next({q1: 'england'}, 'a');

                            expect(section.id).toEqual('c');
                            expect(section.context.progress).toEqual(['a', 'c']);
                        });

                        it('should clear affected progress #2', () => {
                            const router = createQRouter({
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
                                                ANSWER: [
                                                    {
                                                        target: 'c',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.b.q1',
                                                                    'scotland'
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'd',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.b.q1',
                                                                    'england'
                                                                ]
                                                            }
                                                        }
                                                    }
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
                                }
                            });

                            router.next();
                            router.next({q1: 'scotland'});
                            const section = router.next({q1: 'england'}, 'b');

                            expect(section.id).toEqual('d');
                            expect(section.context.progress).toEqual(['a', 'b', 'd']);
                        });
                    });

                    describe('Section relies on another section', () => {
                        it('should clear affected progress', () => {
                            const router = createQRouter({
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
                                                ANSWER: [
                                                    {
                                                        target: 'c',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.a.q1',
                                                                    'scotland'
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        type: 'final'
                                                    }
                                                ]
                                            }
                                        },
                                        c: {
                                            type: 'final'
                                        }
                                    }
                                }
                            });

                            router.next({q1: 'scotland'});
                            router.next();
                            const section = router.next({q1: 'england'}, 'a');

                            expect(section.id).toEqual('b');
                            expect(section.context.progress).toEqual(['a', 'b']);
                        });
                    });

                    describe('Section relies on multiple sections', () => {
                        it('should clear affected progress', () => {
                            const router = createQRouter({
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
                                                ANSWER: [
                                                    {
                                                        target: 'd',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.a.q1',
                                                                    '$.answers.b.q1',
                                                                    1
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        type: 'final'
                                                    }
                                                ]
                                            }
                                        },
                                        d: {
                                            type: 'final'
                                        }
                                    }
                                }
                            });

                            router.next({q1: 0});
                            router.next({q1: 1});
                            router.next();
                            const section = router.next({q1: 1}, 'a');

                            expect(section.id).toEqual('b');
                            expect(section.context.progress).toEqual(['a', 'b']);
                        });
                    });

                    describe('Same answer is provided', () => {
                        it('should leave progress unaffected if the same single answer is provided', () => {
                            const router = createQRouter({
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
                                                ANSWER: [
                                                    {
                                                        target: 'c',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.b.q1',
                                                                    'scotland'
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'd',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.b.q1',
                                                                    'england'
                                                                ]
                                                            }
                                                        }
                                                    }
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
                                }
                            });

                            router.next();
                            router.next({q1: 'scotland'});
                            const section = router.next({q1: 'scotland'}, 'b');

                            expect(section.id).toEqual('c');
                            expect(section.context.progress).toEqual(['a', 'b', 'c']);
                        });

                        it('should leave progress unaffected if a changed answer does not cause a cascade', () => {
                            const router = createQRouter({
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
                                                ANSWER: [
                                                    {
                                                        target: 'c',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.b.q1',
                                                                    'scotland'
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'd',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.b.q1',
                                                                    'england'
                                                                ]
                                                            }
                                                        }
                                                    }
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
                                }
                            });

                            router.next();
                            router.next({q1: 'scotland', q2: 'Peppa', q3: 'Suzy'});
                            const section = router.next(
                                // Only q1 is used in conditions. Changing q2 or q3 should cause no cascade
                                {q2: 'Peppa', q1: 'scotland', q3: 'George'},
                                'b'
                            );

                            expect(section.id).toEqual('c');
                            expect(section.context.progress).toEqual(['a', 'b', 'c']);
                        });

                        // Currently the router only detects cascade at the page level instead of the answers on the page.
                        // TODO: Get this test passing for question level detection
                        // eslint-disable-next-line jest/no-commented-out-tests
                        // it('should leave progress unaffected if a changed answer does not cause a cascade #2', () => {
                        //     const router = createQRouter({
                        //         routes: {
                        //             initial: 'a',
                        //             states: {
                        //                 a: {
                        //                     on: {
                        //                         ANSWER: 'b'
                        //                     }
                        //                 },
                        //                 b: {
                        //                     on: {
                        //                         ANSWER: 'c'
                        //                     }
                        //                 },
                        //                 c: {
                        //                     on: {
                        //                         ANSWER: [
                        //                             {
                        //                                 target: 'd',
                        //                                 guard: {
                        // type: 'evaluateRoute',
                        // params: {
                        //            cond: [
                        //                                     '==',
                        //                                     '$.answers.a.q1',
                        //                                     '$.answers.b.q1',
                        //                                     1
                        //                                 ]
                        // }
                        // }
                        //                             },
                        //                             {
                        //                                 type: 'final'
                        //                             }
                        //                         ]
                        //                     }
                        //                 },
                        //                 d: {
                        //                     type: 'final'
                        //                 }
                        //             }
                        //         }
                        //     });

                        //     router.next({q1: 1, q2: 2, q3: 3});
                        //     router.next({q1: 1});
                        //     router.next();
                        //     // Only q1 is used in conditions. Changing q2 or q3 should cause no cascade
                        //     const section = router.next({q3: 4, q1: 1, q2: 2}, 'a');

                        //     expect(section.id).toEqual('d');
                        //     expect(section.context.progress).toEqual(['a', 'b', 'c', 'd']);
                        // });
                    });

                    describe('Retract answers', () => {
                        it('should retract answers for sections removed from progress', () => {
                            const router = createQRouter({
                                routes: {
                                    initial: 'a',
                                    states: {
                                        a: {
                                            on: {
                                                ANSWER: [
                                                    {
                                                        target: 'b',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.a.q1',
                                                                    'foo'
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'c',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.a.q1',
                                                                    'bar'
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        b: {
                                            on: {
                                                ANSWER: [{target: 'd'}]
                                            }
                                        },
                                        c: {
                                            on: {
                                                ANSWER: [{target: 'd'}]
                                            }
                                        },
                                        d: {
                                            on: {
                                                ANSWER: [
                                                    {
                                                        target: 'e',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: ['==', '$.answers.b.q1', 1]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'f',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: ['==', '$.answers.c.q1', 1]
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        e: {type: 'final'},
                                        f: {type: 'final'}
                                    }
                                }
                            });

                            // current is a
                            router.next({q1: 'foo'}); // a's answer, goto b
                            router.next({q1: 1}); // b's answer, goto d
                            router.next({q1: 1}); // d's answer, goto e

                            router.previous(); // backtrack to d
                            router.previous(); // backtrack to b
                            router.previous(); // backtrack to a

                            router.next({q1: 'bar'}); // a's answer, goto c - causes cascade removing b, d, e from progress

                            const questionnaire = router.current().context;

                            expect(questionnaire.progress).toEqual(['a', 'c']);
                            expect(questionnaire.answers).toHaveProperty('a');
                            expect(questionnaire.answers.a).toEqual({
                                q1: 'bar'
                            });
                            expect(questionnaire.retractedAnswers).toEqual({
                                b: {
                                    q1: 1
                                },
                                d: {
                                    q1: 1
                                }
                            });
                        });

                        it('should retract no answers if no progress is removed', () => {
                            const router = createQRouter({
                                routes: {
                                    initial: 'a',
                                    states: {
                                        a: {
                                            on: {
                                                ANSWER: [
                                                    {
                                                        target: 'b',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.a.q1',
                                                                    'foo'
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'c',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    '==',
                                                                    '$.answers.a.q1',
                                                                    'bar'
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        b: {
                                            on: {
                                                ANSWER: [{target: 'd'}]
                                            }
                                        },
                                        c: {
                                            on: {
                                                ANSWER: [{target: 'd'}]
                                            }
                                        },
                                        d: {
                                            on: {
                                                ANSWER: [
                                                    {
                                                        target: 'e',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: ['==', '$.answers.b.q1', 1]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'f',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: ['==', '$.answers.c.q1', 1]
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        e: {type: 'final'},
                                        f: {type: 'final'}
                                    }
                                }
                            });

                            // current is a
                            router.next({q1: 'bar'}); // a's answer, goto c
                            router.next({q1: 1}); // c's answer, goto d
                            router.next({q1: 1}); // d's answer, goto f

                            const questionnaire = router.current().context;

                            expect(questionnaire.progress).toEqual(['a', 'c', 'd', 'f']);
                            expect(questionnaire.answers).toHaveProperty('a');
                            expect(questionnaire.answers).toHaveProperty('c');
                            expect(questionnaire.answers).toHaveProperty('d');
                            expect(questionnaire.answers.a).toEqual({
                                q1: 'bar'
                            });
                            expect(questionnaire.answers.c).toEqual({
                                q1: 1
                            });
                            expect(questionnaire.answers.d).toEqual({
                                q1: 1
                            });
                            expect(questionnaire.retractedAnswers).toEqual({});
                        });
                    });
                });

                describe('Cascade: updating answer removes subsequent progress for routes using roles', () => {
                    describe('Section relies on its own answer for routing', () => {
                        it('should clear affected progress using user roles.all in routing', () => {
                            const router = createQRouter({
                                attributes: {
                                    q__roles: {
                                        foo: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'scotland']
                                            }
                                        },
                                        bar: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'england']
                                            }
                                        },
                                        baz: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'scotland']
                                            }
                                        },
                                        qux: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'wales']
                                            }
                                        }
                                    }
                                },
                                routes: {
                                    initial: 'a',
                                    states: {
                                        a: {
                                            on: {
                                                ANSWER: [
                                                    {
                                                        target: 'b',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    'or',
                                                                    ['|role.all', 'foo', 'baz'],
                                                                    ['|role.all', 'baz'],
                                                                    ['==', '$.answers.b.q9', true]
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'c',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    'or',
                                                                    ['|role.all', 'bar'],
                                                                    ['|role.all', 'qux'],
                                                                    ['==', '$.answers.b.q9', true]
                                                                ]
                                                            }
                                                        }
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
                                            type: 'final'
                                        }
                                    }
                                }
                            });

                            router.next({q1: 'scotland'});
                            router.next();
                            const section = router.next({q1: 'england'}, 'a');

                            expect(section.id).toEqual('c');
                            expect(section.context.progress).toEqual(['a', 'c']);
                        });

                        it('should clear affected progress using user roles.all in routing #2', () => {
                            const router = createQRouter({
                                attributes: {
                                    q__roles: {
                                        foo: {
                                            schema: {
                                                const: ['==', '$.answers.b.q1', 'scotland']
                                            }
                                        },
                                        bar: {
                                            schema: {
                                                const: ['==', '$.answers.b.q1', 'england']
                                            }
                                        },
                                        baz: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'ireland']
                                            }
                                        },
                                        qux: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'wales']
                                            }
                                        }
                                    }
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
                                                ANSWER: [
                                                    {
                                                        target: 'c',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    'or',
                                                                    ['|role.all', 'foo'],
                                                                    ['|role.all', 'baz'],
                                                                    ['==', '$.answers.b.q9', true]
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'd',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    'or',
                                                                    ['|role.all', 'bar'],
                                                                    ['|role.all', 'qux'],
                                                                    ['==', '$.answers.b.q9', true]
                                                                ]
                                                            }
                                                        }
                                                    }
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
                                }
                            });

                            router.next();
                            router.next({q1: 'scotland'});
                            const section = router.next({q1: 'england'}, 'b');

                            expect(section.id).toEqual('d');
                            expect(section.context.progress).toEqual(['a', 'b', 'd']);
                        });

                        it('should clear affected progress using user roles.any in routing', () => {
                            const router = createQRouter({
                                attributes: {
                                    q__roles: {
                                        foo: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'scotland']
                                            }
                                        },
                                        bar: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'england']
                                            }
                                        },
                                        baz: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'ireland']
                                            }
                                        },
                                        quz: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'wales']
                                            }
                                        }
                                    }
                                },
                                routes: {
                                    initial: 'a',
                                    states: {
                                        a: {
                                            on: {
                                                ANSWER: [
                                                    {
                                                        target: 'b',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    'and',
                                                                    [
                                                                        '==',
                                                                        '$.answers.a.q1',
                                                                        'scotland'
                                                                    ],
                                                                    [
                                                                        'or',
                                                                        [
                                                                            '==',
                                                                            '$.answers.b.q10',
                                                                            true
                                                                        ],
                                                                        ['|role.any', 'foo', 'baz']
                                                                    ]
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'c',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: [
                                                                    'and',
                                                                    [
                                                                        '==',
                                                                        '$.answers.a.q1',
                                                                        'england'
                                                                    ],
                                                                    [
                                                                        'or',
                                                                        [
                                                                            '==',
                                                                            '$.answers.b.q9',
                                                                            true
                                                                        ],
                                                                        ['|role.any', 'bar', 'quz']
                                                                    ]
                                                                ]
                                                            }
                                                        }
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
                                            type: 'final'
                                        }
                                    }
                                }
                            });

                            router.next({q1: 'scotland'});
                            router.next();
                            const section = router.next({q1: 'england'}, 'a');

                            expect(section.id).toEqual('c');
                            expect(section.context.progress).toEqual(['a', 'c']);
                        });

                        it('should clear affected progress using user roles.any in routing #2', () => {
                            const router = createQRouter({
                                attributes: {
                                    q__roles: {
                                        foo: {
                                            schema: {
                                                const: ['==', '$.answers.b.q1', 'scotland']
                                            }
                                        },
                                        bar: {
                                            schema: {
                                                const: ['==', '$.answers.b.q1', 'england']
                                            }
                                        },
                                        baz: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'ireland']
                                            }
                                        },
                                        quz: {
                                            schema: {
                                                const: ['==', '$.answers.a.q1', 'wales']
                                            }
                                        }
                                    }
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
                                                ANSWER: [
                                                    {
                                                        target: 'c',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: ['|role.any', 'foo', 'baz']
                                                            }
                                                        }
                                                    },
                                                    {
                                                        target: 'd',
                                                        guard: {
                                                            type: 'evaluateRoute',
                                                            params: {
                                                                cond: ['|role.any', 'bar', 'quz']
                                                            }
                                                        }
                                                    }
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
                                }
                            });

                            router.next();
                            router.next({q1: 'scotland'});
                            const section = router.next({q1: 'england'}, 'b');

                            expect(section.id).toEqual('d');
                            expect(section.context.progress).toEqual(['a', 'b', 'd']);
                        });
                    });
                });
            });
        });

        describe('Previous', () => {
            it('should move to the previous route', () => {
                const router = createQRouter({
                    routes: {
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
                    }
                });

                router.next('ANSWER');
                const section = router.previous();

                expect(section.id).toEqual('a');
                expect(section.context.progress).toEqual(['a', 'b']);
            });

            it('should throw if previous() is called on the first progress element', () => {
                const router = createQRouter({
                    routes: {
                        initial: 'a',
                        states: {
                            a: {
                                type: 'final'
                            }
                        }
                    }
                });

                const rxExpectedError = errorMessageToRegExp(
                    `There are no previous sections before section: "a"`
                );

                expect(() => router.previous()).toThrow(rxExpectedError);
            });

            it('should return undefined if previous() attempts to advance to a section that has not been visited', () => {
                const router = createQRouter({
                    routes: {
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
                    }
                });

                const section = router.previous('b');

                expect(section).toEqual(undefined);
            });
        });

        describe('Current', () => {
            it('should get the current section', () => {
                const router = createQRouter({
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
                                type: 'final'
                            }
                        }
                    }
                });

                router.next();
                router.next();
                router.next(null, 'a');

                const section = router.current();

                expect(section.id).toEqual('b');
                expect(section.context.progress).toEqual(['a', 'b', 'c']);
            });

            it('should set the current section', () => {
                const router = createQRouter({
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
                                type: 'final'
                            }
                        }
                    }
                });

                router.next();
                router.next();

                const section = router.current('a');

                expect(section.id).toEqual('a');
                expect(section.context.progress).toEqual(['a', 'b', 'c']);
            });

            it('should return undefined if current() attempts to advance to a section that has not been visited', () => {
                const router = createQRouter({
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
                                type: 'final'
                            }
                        }
                    }
                });

                router.next();

                const section = router.current('c');

                expect(section).toEqual(undefined);
            });
        });

        describe('First', () => {
            it('should get the first section from the progress', () => {
                const router = createQRouter({
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
                                type: 'final'
                            }
                        }
                    }
                });

                router.next(); // b
                router.next(); // c

                const section = router.first();

                expect(section.id).toEqual('a');
                expect(section.context.progress).toEqual(['a', 'b', 'c']);
            });
        });

        describe('Last', () => {
            it('should get the last section from the progress', () => {
                const router = createQRouter({
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
                                type: 'final'
                            }
                        }
                    }
                });

                router.next(); // b
                router.next(); // c
                router.next(null, 'a'); // b

                const section = router.last();

                expect(section.id).toEqual('c');
                expect(section.context.progress).toEqual(['a', 'b', 'c']);
            });
        });

        describe('Operators', () => {
            it('should return true if dateExceedsTwoYearsFromToday', () => {
                const router = qRouter({
                    routes: {
                        initial: 'section1',
                        states: {
                            section1: {
                                on: {
                                    ANSWER: [
                                        {
                                            target: 'section2',
                                            guard: {
                                                type: 'evaluateRoute',
                                                params: {
                                                    cond: [
                                                        'dateExceedsTwoYearsFromNow',
                                                        '$.answers.section1.q1'
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            target: 'section3'
                                        }
                                    ]
                                }
                            },
                            section2: {},
                            section3: {}
                        }
                    }
                });

                const nextSectionId = router.next({q1: '2017-02-01T00:00Z'}).id;

                expect(nextSectionId).toEqual('section2');
            });

            it('should return false if not dateExceedsTwoYearsFromToday', () => {
                const router = qRouter({
                    routes: {
                        initial: 'section1',
                        states: {
                            section1: {
                                on: {
                                    ANSWER: [
                                        {
                                            target: 'section2',
                                            guard: {
                                                type: 'evaluateRoute',
                                                params: {
                                                    cond: [
                                                        'dateExceedsTwoYearsFromNow',
                                                        '$.answers.section1.q1'
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            target: 'section3'
                                        }
                                    ]
                                }
                            },
                            section2: {},
                            section3: {}
                        }
                    }
                });

                const nextSectionId = router.next({q1: '2099-12-01T00:00Z'}).id;

                expect(nextSectionId).toEqual('section3');
            });

            it('should return true if dateLessThanEighteenYearsAgo and date entered is less than 18 years ago', () => {
                const router = qRouter({
                    routes: {
                        initial: 'section1',
                        states: {
                            section1: {
                                on: {
                                    ANSWER: [
                                        {
                                            target: 'section2',
                                            guard: {
                                                type: 'evaluateRoute',
                                                params: {
                                                    cond: [
                                                        'dateLessThanEighteenYearsAgo',
                                                        '$.answers.section1.q1'
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            target: 'section3'
                                        }
                                    ]
                                }
                            },
                            section2: {},
                            section3: {}
                        }
                    }
                });

                const nextSectionId = router.next({q1: '2015-02-01T00:00Z'}).id;

                expect(nextSectionId).toEqual('section2');
            });

            it('should return false if dateLessThanEighteenYearsAgo and date entered is more than 18 years ago', () => {
                const router = qRouter({
                    routes: {
                        initial: 'section1',
                        states: {
                            section1: {
                                on: {
                                    ANSWER: [
                                        {
                                            target: 'section2',
                                            guard: {
                                                type: 'evaluateRoute',
                                                params: {
                                                    cond: [
                                                        'dateLessThanEighteenYearsAgo',
                                                        '$.answers.section1.q1'
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            target: 'section3'
                                        }
                                    ]
                                }
                            },
                            section2: {},
                            section3: {}
                        }
                    }
                });
                const nextSectionId = router.next({q1: '1985-02-01T00:00Z'}).id;

                expect(nextSectionId).toEqual('section3');
            });

            it('should return true if dateDifferenceGreaterThanTwoDays', () => {
                const router = qRouter({
                    routes: {
                        initial: 'section1',
                        states: {
                            section1: {
                                on: {
                                    ANSWER: [
                                        {
                                            target: 'section2'
                                        }
                                    ]
                                }
                            },
                            section2: {
                                on: {
                                    ANSWER: [
                                        {
                                            target: 'section3',
                                            guard: {
                                                type: 'evaluateRoute',
                                                params: {
                                                    cond: [
                                                        'dateDifferenceGreaterThanTwoDays',
                                                        '$.answers.section1.q1',
                                                        '$.answers.section2.q2'
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            target: 'section4'
                                        }
                                    ]
                                }
                            },
                            section3: {},
                            section4: {}
                        }
                    }
                });
                router.next({q1: '2015-02-01T00:00Z'});
                const nextSectionId = router.next({q2: '2015-02-05T00:00Z'}).id;

                expect(nextSectionId).toEqual('section3');
            });

            it('should return false if not dateDifferenceGreaterThanTwoDays', () => {
                const router = qRouter({
                    routes: {
                        initial: 'section1',
                        states: {
                            section1: {
                                on: {
                                    ANSWER: [
                                        {
                                            target: 'section2'
                                        }
                                    ]
                                }
                            },
                            section2: {
                                on: {
                                    ANSWER: [
                                        {
                                            target: 'section3',
                                            guard: {
                                                type: 'evaluateRoute',
                                                params: {
                                                    cond: [
                                                        'dateDifferenceGreaterThanTwoDays',
                                                        '$.answers.section1.q1',
                                                        '$.answers.section2.q1'
                                                    ]
                                                }
                                            }
                                        },
                                        {
                                            target: 'section4'
                                        }
                                    ]
                                }
                            },
                            section3: {},
                            section4: {}
                        }
                    }
                });
                router.next({q1: '2015-02-01T00:00Z'});
                const nextSectionId = router.next({q1: '2015-02-02T00:00Z'}).id;

                expect(nextSectionId).toEqual('section4');
            });
            describe('dateCompare', () => {
                it('should return true if far enough in the past (in years)', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '>', // is more than ...
                                                            '-12', // 12 ...
                                                            'years' // years (before, due to the negative (-12) ...
                                                            // today's date (no second date given. defaults to today's date).
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({q1: '2005-02-01T00:00:00.000Z'}).id;

                    expect(nextSectionId).toEqual('section2');
                });

                it('should return false if not far enough in the past (in years)', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '>', // is more than ...
                                                            '-12', // 12 ...
                                                            'years' // years (before, due to the negative (-12) ...
                                                            // today's date (no second date given. defaults to today's date).
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: `${new Date().getFullYear() - 5}-02-01T00:00:00.000Z`
                    }).id;

                    expect(nextSectionId).toEqual('section3');
                });

                it('should return true if far enough in the past (in days)', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '<', // is less than...
                                                            '-2', // 2 ...
                                                            'days', // days (before, due to the negative (-2) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-06-09T00:00:00.000Z',
                        q2: '2009-06-10T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section2');
                });

                it('should return false if far enough in the past (in days)', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '<', // is less than...
                                                            '-2', // 2 ...
                                                            'days', // days (before, due to the negative (-2) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-06-06T00:00:00.000Z',
                        q2: '2009-06-10T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section3');
                });

                it('should return true if is exactly equal (in days)', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '==', // is equal to ...
                                                            '-14', // 14 ...
                                                            'days', // days (before, due to the negative (-14) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-06-03T00:00:00.000Z',
                        q2: '2009-06-17T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section2');
                });

                it('should return false if not exactly equal (in days)', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '==', // is equal to ...
                                                            '10', // 10 ...
                                                            'days', // days (after, due to the positve (10) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-06-22T00:00:00.000Z',
                        q2: '2009-06-03T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section3');
                });

                it('should return true if dates are the same and comparing them with no difference', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '==', // is equal to ...
                                                            '0', // 0 ...
                                                            'days', // days (after, due to the positive (0) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-06-17T00:00:00.000Z',
                        q2: '2009-06-17T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section2');
                });

                it('should return false if `diff` is a positive non-zero and `amount` rule[3] is `0`', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '==', // is equal to ...
                                                            '0', // 0 ...
                                                            'days', // days (after, due to the positive (0) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-06-17T00:00:00.000Z',
                        q2: '2009-06-15T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section3');
                });

                it('should return false if `diff` is a negative non-zero and `amount` rule[3] is `0`', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '==', // is equal to ...
                                                            '0', // 0 ...
                                                            'days', // days (after, due to the positive (0) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-06-15T00:00:00.000Z',
                        q2: '2009-06-17T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section3');
                });

                it('should return false if `diff` `0` and `amount` rule[3] is a positive non-zero', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '==', // is equal to ...
                                                            '2', // 0 ...
                                                            'days', // days (after, due to the positive (0) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-06-17T00:00:00.000Z',
                        q2: '2009-06-17T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section3');
                });

                it('should return false if `diff` `0` and `amount` rule[3] is a negative non-zero', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '==', // is equal to ...
                                                            '-2', // 0 ...
                                                            'days', // days (after, due to the positive (0) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-06-17T00:00:00.000Z',
                        q2: '2009-06-17T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section3');
                });

                it('should return true if is more than or equal (in days) - equal to', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '>=', // is more than or equal to ...
                                                            '2', // 2 ...
                                                            'days', // days (after, due to the positive (2) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-02-16T00:00:00.000Z',
                        q2: '2009-02-14T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section2');
                });

                it('should return true if is more than or equal (in days) - more than', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '>=', // is more than or equal to ...
                                                            '2', // 2 ...
                                                            'days', // days (after, due to the positive (2) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-02-23T00:00:00.000Z',
                        q2: '2009-02-14T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section2');
                });

                it('should return true if is less than or equal (in days) - equal to', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '<=', // is less than or equal to ...
                                                            '4', // 4 ...
                                                            'days', // days (after, due to the positive (4) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-02-20T00:00:00.000Z',
                        q2: '2009-02-16T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section2');
                });

                it('should return true if is less than or equal (in days) - less than', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '<=', // is less than or equal to ...
                                                            '4', // 4 ...
                                                            'days', // days (after, due to the positive (4) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-02-17T00:00:00.000Z',
                        q2: '2009-02-16T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section2');
                });

                it('should return false if comparison direction does not match actual diff direction', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '<', // is less than...
                                                            '8', // 8 ...
                                                            'days', // days (after, due to the positive (8) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-06-06T00:00:00.000Z',
                        q2: '2009-06-10T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section3');
                });

                it('should default to more than (`>`) operand if an unsupported operand is supplied', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '<>', // unsupported. non-js syntax for "not equal to"...
                                                            '2', // 2 ...
                                                            'days', // days (after, due to the positive (2) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2009-06-15T00:00:00.000Z',
                        q2: '2009-06-10T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section2');
                });

                it('should default to "years" units if an unsupported unit is supplied', () => {
                    const router = qRouter({
                        routes: {
                            initial: 'section1',
                            states: {
                                section1: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'section2',
                                                guard: {
                                                    type: 'evaluateRoute',
                                                    params: {
                                                        cond: [
                                                            'dateCompare',
                                                            '$.answers.section1.q1', // this date ...
                                                            '>', // more than ...
                                                            '2', // 2 ...
                                                            'decades', // decades (after, due to the positive (2) ...
                                                            '$.answers.section1.q2' // this date.
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                target: 'section3'
                                            }
                                        ]
                                    }
                                },
                                section2: {},
                                section3: {}
                            }
                        }
                    });

                    const nextSectionId = router.next({
                        q1: '2014-06-15T00:00:00.000Z',
                        q2: '2009-06-10T00:00:00.000Z'
                    }).id;

                    expect(nextSectionId).toEqual('section2');
                });
            });
        });
    });
});
