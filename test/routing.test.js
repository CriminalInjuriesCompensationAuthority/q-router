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

                    expect(section.context.answers).toEqual({
                        a: {
                            q1: 'answer'
                        }
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

                    expect(section.context.answers).toEqual({
                        a: {
                            q1: 'answer a'
                        },
                        b: {
                            q1: 'edited answer b'
                        }
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

                    expect(section.context.answers).toEqual({
                        a: {
                            q1: 'answer a'
                        },
                        b: {
                            q1: 'edited answer b'
                        }
                    });
                });

                describe('Cascade: updating answer affects existing progress', () => {
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
                                                        cond: ['==', '$.answers.a.q1', 'scotland']
                                                    },
                                                    {
                                                        target: 'c',
                                                        cond: ['==', '$.answers.a.q1', 'england']
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
                                                        cond: ['==', '$.answers.b.q1', 'scotland']
                                                    },
                                                    {
                                                        target: 'd',
                                                        cond: ['==', '$.answers.b.q1', 'england']
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
                                                        cond: ['==', '$.answers.a.q1', 'scotland']
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
                                                        cond: [
                                                            '==',
                                                            '$.answers.a.q1',
                                                            '$.answers.b.q1',
                                                            1
                                                        ]
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
                                                        cond: ['==', '$.answers.b.q1', 'scotland']
                                                    },
                                                    {
                                                        target: 'd',
                                                        cond: ['==', '$.answers.b.q1', 'england']
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
                                                        cond: ['==', '$.answers.b.q1', 'scotland']
                                                    },
                                                    {
                                                        target: 'd',
                                                        cond: ['==', '$.answers.b.q1', 'england']
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
                        //                                 cond: [
                        //                                     '==',
                        //                                     '$.answers.a.q1',
                        //                                     '$.answers.b.q1',
                        //                                     1
                        //                                 ]
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
                                            cond: [
                                                'dateExceedsTwoYearsFromNow',
                                                '$.answers.section1.q1'
                                            ]
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
                                            cond: [
                                                'dateExceedsTwoYearsFromNow',
                                                '$.answers.section1.q1'
                                            ]
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

                const nextSectionId = router.next({q1: '2018-12-01T00:00Z'}).id;

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
                                            cond: [
                                                'dateLessThanEighteenYearsAgo',
                                                '$.answers.section1.q1'
                                            ]
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
                                            cond: [
                                                'dateLessThanEighteenYearsAgo',
                                                '$.answers.section1.q1'
                                            ]
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
                                            cond: [
                                                'dateDifferenceGreaterThanTwoDays',
                                                '$.answers.section1.q1',
                                                '$.answers.section2.q2'
                                            ]
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
                                            cond: [
                                                'dateDifferenceGreaterThanTwoDays',
                                                '$.answers.section1.q1',
                                                '$.answers.section2.q1'
                                            ]
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
        });
    });

    // #################################################################################################################################
    // #################################################################################################################################
    // #################################################################################################################################
    // #################################################################################################################################
    // #################################################################################################################################

    //     describe('qRouter', () => {
    //         let questionnaire;

    //         beforeEach(() => {
    //             questionnaire = {
    //                 routes: {
    //                     initial: 'a',
    //                     states: {
    //                         a: {
    //                             on: {
    //                                 ANSWER: 'b'
    //                             }
    //                         },
    //                         b: {
    //                             on: {
    //                                 ANSWER: 'c'
    //                             }
    //                         },
    //                         c: {
    //                             on: {
    //                                 ANSWER: 'd'
    //                             }
    //                         },
    //                         d: {}
    //                     }
    //                 }
    //             };
    //         });

    //         it('should start at the specified section', () => {
    //             const router = qRouter(questionnaire);

    //             expect(router.current().id).toEqual('a');
    //         });

    //         it('should store a supplied value against the current state', () => {
    //             const router = qRouter(questionnaire);
    //             const section = router.next('ANSWER', {
    //                 q1: 'value of answer'
    //             });

    //             expect(section.context.answers).toEqual({
    //                 a: {
    //                     q1: {value: 'value of answer'}
    //                 }
    //             });
    //         });

    //         it('should store a supplied value with multiple keys against the current state', () => {
    //             const router = qRouter(questionnaire);
    //             const section = router.next('ANSWER', {
    //                 q1: 'value of answer 1',
    //                 q2: 'value of answer 2'
    //             });

    //             expect(section.context.answers).toEqual({
    //                 a: {
    //                     q1: {value: 'value of answer 1'},
    //                     q2: {value: 'value of answer 2'}
    //                 }
    //             });
    //         });

    //         it('should overwrite the previous answer when the question is edited', () => {
    //             const router = qRouter(questionnaire);

    //             // answer questions
    //             router.next('ANSWER', {
    //                 q1: 'value of answer 1',
    //                 q2: 'value of answer 2'
    //             });

    //             // go back to question
    //             router.previous();

    //             // edit question
    //             const section = router.next('ANSWER', {
    //                 q1: 'value of answer 1 edited',
    //                 q2: 'value of answer 2 edited'
    //             });

    //             expect(section.context.answers).toEqual({
    //                 a: {
    //                     q1: {value: 'value of answer 1 edited'},
    //                     q2: {value: 'value of answer 2 edited'}
    //                 }
    //             });
    //         });

    //         describe('Repeatable sections', () => {
    //             let questionnaireWithRepeatableSections;

    //             beforeEach(() => {
    //                 questionnaireWithRepeatableSections = {
    //                     routes: {
    //                         initial: 'p-number-of-attackers',
    //                         states: {
    //                             'p-number-of-attackers': {
    //                                 on: {
    //                                     ANSWER: 'p-attacker-names'
    //                                 }
    //                             },
    //                             'p-attacker-names': {
    //                                 repeatable: true,
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'p-attacker-names',
    //                                             // This will repeat the enter attacker name question, based on the answer given to how many attackers were involved
    //                                             // e.g. 3 attackers, for each attacker enter their name
    //                                             cond: [
    //                                                 'answeredLessThan',
    //                                                 'p-attacker-names',
    //                                                 'q-number-of-attackers'
    //                                             ]
    //                                         },
    //                                         {
    //                                             target: 'section3'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             section3: {}
    //                         }
    //                     }
    //                 };
    //             });

    //             it('should allow a page to be repeated', () => {
    //                 const router = qRouter(questionnaireWithRepeatableSections);

    //                 // answer questions
    //                 router.next('ANSWER', {'q-number-of-attackers': 2});
    //                 router.next('ANSWER', {
    //                     'q-attacker-first-name': 'Peppa',
    //                     'q-attacker-last-name': 'Pig'
    //                 });
    //                 router.next('ANSWER', {
    //                     'q-attacker-first-name': 'Rebecca',
    //                     'q-attacker-last-name': 'Rabbit'
    //                 });
    //                 const section = router.next('ANSWER', {bla: 3});

    //                 expect(section.context.answers).toEqual({
    //                     'p-number-of-attackers': {
    //                         'q-number-of-attackers': {value: 2}
    //                     },
    //                     'p-attacker-names': [
    //                         {
    //                             'q-attacker-first-name': {value: 'Peppa'},
    //                             'q-attacker-last-name': {value: 'Pig'}
    //                         },
    //                         {
    //                             'q-attacker-first-name': {value: 'Rebecca'},
    //                             'q-attacker-last-name': {value: 'Rabbit'}
    //                         }
    //                     ],
    //                     section3: {
    //                         bla: {value: 3}
    //                     }
    //                 });
    //             });

    //             it('should be able to start with a self referencing repeatable section', () => {
    //                 const router = qRouter({
    //                     routes: {
    //                         initial: 'a',
    //                         states: {
    //                             a: {
    //                                 repeatable: true,
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'a',
    //                                             cond: ['answeredLessThan', 'a', 3]
    //                                         },
    //                                         {
    //                                             target: 'b'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             b: {
    //                                 on: {
    //                                     ANSWER: 'c'
    //                                 }
    //                             },
    //                             c: {
    //                                 on: {
    //                                     ANSWER: 'd'
    //                                 }
    //                             },
    //                             d: {}
    //                         }
    //                     }
    //                 });

    //                 router.next('ANSWER', {aQ1: 1});
    //                 router.next('ANSWER', {aQ2: 2});
    //                 router.next('ANSWER', {aQ3: 3});
    //                 router.next('ANSWER', {bQ1: 4});
    //                 const section = router.next('ANSWER', {cQ1: 5});

    //                 expect(section.context.progress).toEqual(['a', 'a/2', 'a/3', 'b', 'c', 'd']);
    //                 expect(section.context.answers).toEqual({
    //                     a: [{aQ1: {value: 1}}, {aQ2: {value: 2}}, {aQ3: {value: 3}}],
    //                     b: {bQ1: {value: 4}},
    //                     c: {cQ1: {value: 5}}
    //                 });
    //             });

    //             it('should be able to start with a multi section repeatable', () => {
    //                 const router = qRouter({
    //                     routes: {
    //                         initial: 'a',
    //                         states: {
    //                             a: {
    //                                 repeatable: true,
    //                                 on: {
    //                                     ANSWER: 'b'
    //                                 }
    //                             },
    //                             b: {
    //                                 repeatable: true,
    //                                 on: {
    //                                     ANSWER: 'c'
    //                                 }
    //                             },
    //                             c: {
    //                                 repeatable: true,
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'a',
    //                                             cond: ['answeredLessThan', 'c', 3]
    //                                         },
    //                                         {
    //                                             target: 'd'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             d: {}
    //                         }
    //                     }
    //                 });

    //                 router.next('ANSWER', {aQ1: 1});
    //                 router.next('ANSWER', {bQ1: 2});
    //                 router.next('ANSWER', {cQ1: 3});
    //                 router.next('ANSWER', {aQ1: 4});
    //                 router.next('ANSWER', {bQ1: 5});
    //                 router.next('ANSWER', {cQ1: 6});
    //                 router.next('ANSWER', {aQ1: 7});
    //                 router.next('ANSWER', {bQ1: 8});
    //                 const section = router.next('ANSWER', {cQ1: 9});

    //                 expect(section.context.progress).toEqual([
    //                     'a',
    //                     'b',
    //                     'c',
    //                     'a/2',
    //                     'b/2',
    //                     'c/2',
    //                     'a/3',
    //                     'b/3',
    //                     'c/3',
    //                     'd'
    //                 ]);
    //                 expect(section.context.answers).toEqual({
    //                     a: [{aQ1: {value: 1}}, {aQ1: {value: 4}}, {aQ1: {value: 7}}],
    //                     b: [{bQ1: {value: 2}}, {bQ1: {value: 5}}, {bQ1: {value: 8}}],
    //                     c: [{cQ1: {value: 3}}, {cQ1: {value: 6}}, {cQ1: {value: 9}}]
    //                 });
    //             });

    //             it('should return a sectionId that contains the array index of the stored answer', () => {
    //                 const router = qRouter(questionnaireWithRepeatableSections);

    //                 // answer questions
    //                 router.next('ANSWER', {'q-number-of-attackers': 3});
    //                 router.next('ANSWER', {
    //                     'q-attacker-first-name': 'Peppa1',
    //                     'q-attacker-last-name': 'Pig1'
    //                 });
    //                 router.next('ANSWER', {
    //                     'q-attacker-first-name': 'Peppa2',
    //                     'q-attacker-last-name': 'Pig2'
    //                 });
    //                 const section = router.next('ANSWER', {
    //                     'q-attacker-first-name': 'Peppa3',
    //                     'q-attacker-last-name': 'Pig3'
    //                 });

    //                 expect(section.context.progress).toEqual([
    //                     'p-number-of-attackers',
    //                     'p-attacker-names',
    //                     'p-attacker-names/2',
    //                     'p-attacker-names/3',
    //                     'section3'
    //                 ]);
    //             });

    //             it('should overwrite the previous answer when the question is edited', () => {
    //                 const router = qRouter(questionnaireWithRepeatableSections);

    //                 // answer questions
    //                 router.next('ANSWER', {'q-number-of-attackers': 4});
    //                 router.next('ANSWER', {
    //                     'q-attacker-first-name': 'Peppa',
    //                     'q-attacker-last-name': 'Pig'
    //                 });
    //                 router.next('ANSWER', {
    //                     'q-attacker-first-name': 'Rebecca',
    //                     'q-attacker-last-name': 'Rabbit'
    //                 });
    //                 router.next('ANSWER', {
    //                     'q-attacker-first-name': 'Suzie',
    //                     'q-attacker-last-name': 'Sheep'
    //                 });
    //                 router.next('ANSWER', {
    //                     'q-attacker-first-name': 'Mummy',
    //                     'q-attacker-last-name': 'Pig'
    //                 });
    //                 router.next('ANSWER', {bla: 3});

    //                 // go back to question
    //                 router.previous(); // Mummy Pig
    //                 router.previous(); // Suzie Sheep
    //                 router.previous(); // Rebecca Rabbit

    //                 // edit question Rebecca Rabbit to Candy Cat
    //                 const section = router.next('ANSWER', {
    //                     'q-attacker-first-name': 'Candy',
    //                     'q-attacker-last-name': 'Cat'
    //                 });

    //                 expect(section.context.answers).toEqual({
    //                     'p-number-of-attackers': {
    //                         'q-number-of-attackers': {value: 4}
    //                     },
    //                     'p-attacker-names': [
    //                         {
    //                             'q-attacker-first-name': {value: 'Peppa'},
    //                             'q-attacker-last-name': {value: 'Pig'}
    //                         },
    //                         {
    //                             'q-attacker-first-name': {value: 'Candy'},
    //                             'q-attacker-last-name': {value: 'Cat'}
    //                         },
    //                         {
    //                             'q-attacker-first-name': {value: 'Suzie'},
    //                             'q-attacker-last-name': {value: 'Sheep'}
    //                         },
    //                         {
    //                             'q-attacker-first-name': {value: 'Mummy'},
    //                             'q-attacker-last-name': {value: 'Pig'}
    //                         }
    //                     ],
    //                     section3: {
    //                         bla: {value: 3}
    //                     }
    //                 });
    //             });

    //             it('should allow multiple pages to be repeated', () => {
    //                 const router = qRouter({
    //                     routes: {
    //                         initial: 'a',
    //                         states: {
    //                             a: {
    //                                 on: {
    //                                     ANSWER: 'b'
    //                                 }
    //                             },
    //                             b: {
    //                                 on: {
    //                                     ANSWER: 'c'
    //                                 }
    //                             },
    //                             c: {
    //                                 repeatable: true,
    //                                 on: {
    //                                     ANSWER: 'd'
    //                                 }
    //                             },
    //                             d: {
    //                                 repeatable: true,
    //                                 on: {
    //                                     ANSWER: 'e'
    //                                 }
    //                             },
    //                             e: {
    //                                 repeatable: true,
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'c',
    //                                             cond: ['answeredLessThan', 'c', 3]
    //                                         },
    //                                         {
    //                                             target: 'f'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             f: {
    //                                 on: {
    //                                     ANSWER: 'g'
    //                                 }
    //                             },
    //                             g: {}
    //                         }
    //                     }
    //                 });

    //                 // answer questions
    //                 router.next('ANSWER', {'question-a': 1}); // a
    //                 router.next('ANSWER', {'question-b': 1}); // b
    //                 router.next('ANSWER', {'question-c': 1}); // c
    //                 router.next('ANSWER', {'question-d': 1}); // d
    //                 router.next('ANSWER', {'question-e': 1}); // e
    //                 router.next('ANSWER', {'question-c': 2}); // c2
    //                 router.next('ANSWER', {'question-d': 2}); // d2
    //                 router.next('ANSWER', {'question-e': 2}); // e2
    //                 router.next('ANSWER', {'question-c': 3}); // c3
    //                 router.next('ANSWER', {'question-d': 3}); // d3
    //                 router.next('ANSWER', {'question-e': 3}); // e3
    //                 router.next('ANSWER', {'question-f': 1}); // f
    //                 const section = router.next('ANSWER', {'question-g': 1}); // g

    //                 expect(section.context.answers).toEqual({
    //                     a: {'question-a': {value: 1}},
    //                     b: {'question-b': {value: 1}},
    //                     c: [
    //                         {'question-c': {value: 1}},
    //                         {'question-c': {value: 2}},
    //                         {'question-c': {value: 3}}
    //                     ],
    //                     d: [
    //                         {'question-d': {value: 1}},
    //                         {'question-d': {value: 2}},
    //                         {'question-d': {value: 3}}
    //                     ],
    //                     e: [
    //                         {'question-e': {value: 1}},
    //                         {'question-e': {value: 2}},
    //                         {'question-e': {value: 3}}
    //                     ],
    //                     f: {'question-f': {value: 1}},
    //                     g: {'question-g': {value: 1}}
    //                 });
    //             });
    //         });

    //         it('should move to the next section according to the routing rules', () => {
    //             const router = qRouter(questionnaire);

    //             router.next('ANSWER');

    //             expect(router.current().id).toEqual('b');
    //         });

    //         it('should track the routing progress', () => {
    //             const router = qRouter(questionnaire);

    //             router.next('ANSWER');
    //             router.next('ANSWER');
    //             const section = router.next('ANSWER');

    //             expect(section.context.progress).toEqual(['a', 'b', 'c', 'd']);
    //         });

    //         it('should move to the previous state according to the progress', () => {
    //             const router = qRouter(questionnaire);

    //             router.next('ANSWER');
    //             router.next('ANSWER');
    //             router.previous();

    //             expect(router.current().id).toEqual('b');
    //         });

    //         it('should move to the next section based on any conditions', () => {
    //             const router = qRouter({
    //                 routes: {
    //                     initial: 'section1',
    //                     states: {
    //                         section1: {
    //                             on: {
    //                                 ANSWER: [
    //                                     {target: 'section3', cond: ['==', 1, 2]},
    //                                     {target: 'section2', cond: ['==', 2, 2]},
    //                                     {target: 'section4', cond: ['==', 3, 2]}
    //                                 ]
    //                             }
    //                         },
    //                         section2: {
    //                             on: {
    //                                 ANSWER: [
    //                                     {target: 'section4', cond: ['==', 2, 2]},
    //                                     {target: 'section3', cond: ['==', 1, 2]}
    //                                 ]
    //                             }
    //                         },
    //                         section3: {
    //                             on: {
    //                                 ANSWER: 'section4'
    //                             }
    //                         },
    //                         section4: {}
    //                     }
    //                 }
    //             });

    //             router.next('ANSWER');
    //             router.next('ANSWER');

    //             expect(router.current().id).toEqual('section4');
    //         });

    //         it('should assume the condition is true if the "cond" attribute is omitted', () => {
    //             const router = qRouter({
    //                 routes: {
    //                     initial: 'section1',
    //                     states: {
    //                         section1: {
    //                             on: {
    //                                 ANSWER: [
    //                                     {target: 'section3', cond: ['==', 1, 2]},
    //                                     {target: 'section2'}
    //                                 ]
    //                             }
    //                         },
    //                         section2: {},
    //                         section3: {}
    //                     }
    //                 }
    //             });

    //             router.next('ANSWER');

    //             expect(router.current().id).toEqual('section2');
    //         });

    //         it('should be able to use previous answers as data in conditions', () => {
    //             const router = qRouter({
    //                 routes: {
    //                     initial: 'section1',
    //                     states: {
    //                         section1: {
    //                             on: {
    //                                 ANSWER: [
    //                                     {
    //                                         target: 'section3',
    //                                         cond: ['==', '$.answers.section1.q1.value', 2]
    //                                     },
    //                                     {target: 'section2'}
    //                                 ]
    //                             }
    //                         },
    //                         section2: {},
    //                         section3: {}
    //                     }
    //                 }
    //             });

    //             router.next('ANSWER', {
    //                 q1: 2
    //             });

    //             expect(router.current().id).toEqual('section3');
    //         });

    //         it('should use the current progress as the initial state if available', () => {
    //             questionnaire.progress = ['a', 'b', 'c'];

    //             const router = qRouter(questionnaire);

    //             expect(router.current().id).toEqual('c');
    //         });

    //         describe('Progress management', () => {
    //             it('should start with the initial section in progress', () => {
    //                 const router = qRouter(questionnaire);
    //                 const section = router.current();
    //                 expect(section.context.progress).toEqual(['a']);
    //             });

    //             it('should stop non-visited sections from being used', () => {
    //                 const router = qRouter(questionnaire);
    //                 const rxExpectedError = errorMessageToRegExp(
    //                     `Failed to set the current section to id: "c". This section has not yet been visited.`
    //                 );

    //                 // Try and advance to section "c" which has not yet been visited
    //                 expect(() => router.next('ANSWER', {'q-c': 1}, 'c')).toThrow(rxExpectedError);
    //             });

    //             describe('Given the following saved progress ["a", "b", "c", "d"]', () => {
    //                 it('should remove any saved progress sectionIds after the current sectionId', () => {
    //                     const router = qRouter(questionnaire);

    //                     router.next('ANSWER', {'q-a': 1}, 'a');
    //                     router.next('ANSWER', {'q-b': 1}, 'b');
    //                     router.next('ANSWER', {'q-c': 1}, 'c');
    //                     router.next('ANSWER', {'q-d': 1}, 'd');
    //                     const section = router.next('ANSWER', {'q-a': 2}, 'a');

    //                     expect(section.context.progress).toEqual(['a', 'b']);
    //                 });
    //             });
    //         });

    //         it('should return the next section id from the "next" method', () => {
    //             const router = qRouter(questionnaire);
    //             const nextSectionId = router.next('ANSWER', {aQ1: true}).id;

    //             expect(nextSectionId).toEqual('b');
    //         });

    //         it('should return the previous section id from the "previous" method', () => {
    //             const router = qRouter(questionnaire);

    //             router.next('ANSWER', {aQ1: true});
    //             router.next('ANSWER', {bQ1: true});
    //             router.next('ANSWER', {cQ1: true});

    //             const previousSectionId = router.previous().id;

    //             expect(previousSectionId).toEqual('c');
    //         });

    //         describe('Edit from summary section', () => {
    //             it('should return to the summary section if the edit has no cascading affect', () => {
    //                 const router = qRouter({
    //                     routes: {
    //                         initial: 'a',
    //                         states: {
    //                             a: {
    //                                 on: {
    //                                     ANSWER: 'b'
    //                                 }
    //                             },
    //                             b: {
    //                                 on: {
    //                                     ANSWER: 'c',
    //                                     EDIT: [
    //                                         {
    //                                             target: 'summary',
    //                                             cond: ['noCascade', 'b']
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             c: {
    //                                 on: {
    //                                     ANSWER: 'summary'
    //                                 }
    //                             },
    //                             summary: {}
    //                         }
    //                     }
    //                 });

    //                 router.next('ANSWER', {aQ1: true});
    //                 router.next('ANSWER', {bQ1: true});
    //                 router.next('ANSWER', {cQ1: true});

    //                 const section = router.next('EDIT', {bQ1: false}, 'b');

    //                 expect(section.context.progress).toEqual(['a', 'b', 'c', 'summary']);
    //                 expect(section.id).toEqual('summary');
    //                 expect(section.context.answers).toEqual({
    //                     a: {aQ1: {value: true}},
    //                     b: {bQ1: {value: false}},
    //                     c: {cQ1: {value: true}}
    //                 });
    //             });

    //             it('should go to the next section if the edit has a cascading affect', () => {
    //                 const router = qRouter({
    //                     routes: {
    //                         initial: 'a',
    //                         states: {
    //                             a: {
    //                                 on: {
    //                                     ANSWER: 'b'
    //                                 }
    //                             },
    //                             b: {
    //                                 on: {
    //                                     ANSWER: 'c',
    //                                     EDIT: [
    //                                         {
    //                                             target: 'summary',
    //                                             cond: ['noCascade', 'b']
    //                                         },
    //                                         {
    //                                             target: 'c'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             c: {
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'summary',
    //                                             cond: ['==', '$.answers.b.bQ1.value', true]
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             summary: {}
    //                         }
    //                     }
    //                 });

    //                 router.next('ANSWER', {aQ1: true});
    //                 router.next('ANSWER', {bQ1: true});
    //                 router.next('ANSWER', {cQ1: true});

    //                 const section = router.next('EDIT', {bQ1: false}, 'b');

    //                 expect(section.context.progress).toEqual(['a', 'b', 'c']);
    //                 expect(section.id).toEqual('c');
    //                 expect(section.context.answers).toEqual({
    //                     a: {aQ1: {value: true}},
    //                     b: {bQ1: {value: false}},
    //                     c: {cQ1: {value: true}}
    //                 });
    //             });

    //             describe('Repeating sections', () => {
    //                 it('should return to the summary section if the edit has no cascading affect', () => {
    //                     const router = qRouter({
    //                         routes: {
    //                             initial: 'a',
    //                             states: {
    //                                 a: {
    //                                     repeatable: true,
    //                                     on: {
    //                                         ANSWER: [
    //                                             {
    //                                                 target: 'a',
    //                                                 cond: ['answeredLessThan', 'a', 3]
    //                                             },
    //                                             {
    //                                                 target: 'b'
    //                                             }
    //                                         ],
    //                                         EDIT: [
    //                                             {
    //                                                 target: 'summary',
    //                                                 cond: ['noCascade', 'a']
    //                                             },
    //                                             {
    //                                                 target: 'b'
    //                                             }
    //                                         ]
    //                                     }
    //                                 },
    //                                 b: {
    //                                     on: {
    //                                         ANSWER: 'c'
    //                                     }
    //                                 },
    //                                 c: {
    //                                     on: {
    //                                         ANSWER: 'summary'
    //                                     }
    //                                 },
    //                                 summary: {}
    //                             }
    //                         }
    //                     });

    //                     router.next('ANSWER', {aQ1: 1});
    //                     router.next('ANSWER', {aQ2: 2});
    //                     router.next('ANSWER', {aQ3: 3});
    //                     router.next('ANSWER', {bQ1: 4});
    //                     router.next('ANSWER', {cQ1: 5});

    //                     const result = router.next('EDIT', {aQ2: 99}, 'a/2');

    //                     expect(result.context.progress).toEqual([
    //                         'a',
    //                         'a/2',
    //                         'a/3',
    //                         'b',
    //                         'c',
    //                         'summary'
    //                     ]);
    //                 });

    //                 describe('Edit causes cascading affect', () => {
    //                     it('should go to the next section', () => {
    //                         const router = qRouter({
    //                             routes: {
    //                                 initial: 'a',
    //                                 states: {
    //                                     a: {
    //                                         repeatable: true,
    //                                         on: {
    //                                             ANSWER: [
    //                                                 {
    //                                                     target: 'a',
    //                                                     cond: ['answeredLessThan', 'a', 3]
    //                                                 },
    //                                                 {
    //                                                     target: 'b'
    //                                                 }
    //                                             ]
    //                                         }
    //                                     },
    //                                     b: {
    //                                         on: {
    //                                             ANSWER: 'c',
    //                                             EDIT: [
    //                                                 {
    //                                                     target: 'summary',
    //                                                     cond: ['noCascade', 'b']
    //                                                 },
    //                                                 {
    //                                                     target: 'c'
    //                                                 }
    //                                             ]
    //                                         }
    //                                     },
    //                                     c: {
    //                                         on: {
    //                                             ANSWER: [
    //                                                 {
    //                                                     target: 'summary',
    //                                                     cond: ['==', '$.answers.b.bQ1.value', 4]
    //                                                 },
    //                                                 {
    //                                                     target: 'd'
    //                                                 }
    //                                             ]
    //                                         }
    //                                     },
    //                                     d: {},
    //                                     summary: {}
    //                                 }
    //                             }
    //                         });

    //                         router.next('ANSWER', {aQ1: 1});
    //                         router.next('ANSWER', {aQ2: 2});
    //                         router.next('ANSWER', {aQ3: 3});
    //                         router.next('ANSWER', {bQ1: 4});
    //                         router.next('ANSWER', {cQ1: 5});

    //                         const result = router.next('EDIT', {bQ1: 99}, 'b');

    //                         expect(result.context.progress).toEqual(['a', 'a/2', 'a/3', 'b', 'c']);
    //                     });

    //                     it('should skip other repeated answers and go to next section', () => {
    //                         const router = qRouter({
    //                             routes: {
    //                                 initial: 'a',
    //                                 states: {
    //                                     a: {
    //                                         repeatable: true,
    //                                         on: {
    //                                             ANSWER: [
    //                                                 {
    //                                                     target: 'a',
    //                                                     cond: ['answeredLessThan', 'a', 3]
    //                                                 },
    //                                                 {
    //                                                     target: 'b'
    //                                                 }
    //                                             ],
    //                                             EDIT: [
    //                                                 {
    //                                                     target: 'summary',
    //                                                     cond: ['noCascade', 'a']
    //                                                 },
    //                                                 {
    //                                                     target: 'b'
    //                                                 }
    //                                             ]
    //                                         }
    //                                     },
    //                                     b: {
    //                                         repeatable: true,
    //                                         on: {
    //                                             ANSWER: [
    //                                                 {
    //                                                     target: 'b',
    //                                                     cond: ['==', '$.answers.a.0.aQ1.value', 0]
    //                                                 },
    //                                                 {
    //                                                     target: 'c'
    //                                                 }
    //                                             ]
    //                                         }
    //                                     },
    //                                     c: {
    //                                         on: {
    //                                             ANSWER: 'summary'
    //                                         }
    //                                     },
    //                                     summary: {}
    //                                 }
    //                             }
    //                         });

    //                         router.next('ANSWER', {aQ1: 1});
    //                         router.next('ANSWER', {aQ2: 2});
    //                         router.next('ANSWER', {aQ3: 3});
    //                         router.next('ANSWER', {bQ1: 4});
    //                         router.next('ANSWER', {cQ1: 5});

    //                         // Technically this result could/should be "a/3", however for the moment it'll skip it's siblings and go to the next available section e.g. "b"
    //                         const result = router.next('EDIT', {aQ2: 0}, 'a/2');

    //                         expect(result.context.progress).toEqual(['a', 'a/2', 'a/3', 'b']);
    //                         expect(result.id).toEqual('b');
    //                         expect(result.context.answers).toEqual({
    //                             a: [{aQ1: {value: 1}}, {aQ2: {value: 0}}, {aQ3: {value: 3}}],
    //                             b: [{bQ1: {value: 4}}],
    //                             c: {cQ1: {value: 5}}
    //                         });
    //                     });
    //                 });
    //             });
    //         });

    //         it('should throw if a state has no target that evaluates to true', () => {
    //             const router = qRouter({
    //                 routes: {
    //                     initial: 'section1',
    //                     states: {
    //                         section1: {
    //                             on: {
    //                                 ANSWER: [
    //                                     {target: 'section3', cond: ['==', 1, 2]},
    //                                     {target: 'section2', cond: ['==', 1, 2]},
    //                                     {target: 'section4', cond: ['==', 1, 2]}
    //                                 ]
    //                             }
    //                         },
    //                         section2: {
    //                             on: {
    //                                 ANSWER: [
    //                                     {target: 'section4', cond: ['==', 2, 2]},
    //                                     {target: 'section3', cond: ['==', 1, 2]}
    //                                 ]
    //                             }
    //                         },
    //                         section3: {
    //                             on: {
    //                                 ANSWER: 'section4'
    //                             }
    //                         },
    //                         section4: {}
    //                     }
    //                 }
    //             });

    //             const rxExpectedError = errorMessageToRegExp(
    //                 'q-router - State "section1" has no target(s) that evaluate to "true"'
    //             );

    //             expect(() => router.next('ANSWER')).toThrow(rxExpectedError);
    //         });

    //         describe('Operators', () => {
    //             it('should return true if dateExceedsTwoYearsFromToday', () => {
    //                 const router = qRouter({
    //                     routes: {
    //                         initial: 'section1',
    //                         states: {
    //                             section1: {
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'section2',
    //                                             cond: [
    //                                                 'dateExceedsTwoYearsFromNow',
    //                                                 '$.answers.section1.q1.value'
    //                                             ]
    //                                         },
    //                                         {
    //                                             target: 'section3'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             section2: {},
    //                             section3: {}
    //                         }
    //                     }
    //                 });

    //                 const nextSectionId = router.next('ANSWER', {q1: '2017-02-01T00:00Z'}).id;

    //                 expect(nextSectionId).toEqual('section2');
    //             });

    //             it('should return false if not dateExceedsTwoYearsFromToday', () => {
    //                 const router = qRouter({
    //                     routes: {
    //                         initial: 'section1',
    //                         states: {
    //                             section1: {
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'section2',
    //                                             cond: [
    //                                                 'dateExceedsTwoYearsFromNow',
    //                                                 '$.answers.section1.q1.value'
    //                                             ]
    //                                         },
    //                                         {
    //                                             target: 'section3'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             section2: {},
    //                             section3: {}
    //                         }
    //                     }
    //                 });

    //                 const nextSectionId = router.next('ANSWER', {q1: '2018-12-01T00:00Z'}).id;

    //                 expect(nextSectionId).toEqual('section3');
    //             });

    //             it('should return true if dateLessThanEighteenYearsAgo and date entered is less than 18 years ago', () => {
    //                 const router = qRouter({
    //                     routes: {
    //                         initial: 'section1',
    //                         states: {
    //                             section1: {
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'section2',
    //                                             cond: [
    //                                                 'dateLessThanEighteenYearsAgo',
    //                                                 '$.answers.section1.q1.value'
    //                                             ]
    //                                         },
    //                                         {
    //                                             target: 'section3'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             section2: {},
    //                             section3: {}
    //                         }
    //                     }
    //                 });

    //                 const nextSectionId = router.next('ANSWER', {q1: '2015-02-01T00:00Z'}).id;

    //                 expect(nextSectionId).toEqual('section2');
    //             });

    //             it('should return false if dateLessThanEighteenYearsAgo and date entered is more than 18 years ago', () => {
    //                 const router = qRouter({
    //                     routes: {
    //                         initial: 'section1',
    //                         states: {
    //                             section1: {
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'section2',
    //                                             cond: [
    //                                                 'dateLessThanEighteenYearsAgo',
    //                                                 '$.answers.section1.q1.value'
    //                                             ]
    //                                         },
    //                                         {
    //                                             target: 'section3'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             section2: {},
    //                             section3: {}
    //                         }
    //                     }
    //                 });
    //                 const nextSectionId = router.next('ANSWER', {q1: '1985-02-01T00:00Z'}).id;

    //                 expect(nextSectionId).toEqual('section3');
    //             });

    //             it('should return true if dateDifferenceGreaterThanTwoDays', () => {
    //                 const router = qRouter({
    //                     routes: {
    //                         initial: 'section1',
    //                         states: {
    //                             section1: {
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'section2'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             section2: {
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'section3',
    //                                             cond: [
    //                                                 'dateDifferenceGreaterThanTwoDays',
    //                                                 '$.answers.section1.q1.value',
    //                                                 '$.answers.section2.q1.value'
    //                                             ]
    //                                         },
    //                                         {
    //                                             target: 'section4'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             section3: {},
    //                             section4: {}
    //                         }
    //                     }
    //                 });
    //                 router.next('ANSWER', {q1: '2015-02-01T00:00Z'});
    //                 const nextSectionId = router.next('ANSWER', {q1: '2015-02-05T00:00Z'}).id;

    //                 expect(nextSectionId).toEqual('section3');
    //             });

    //             it('should return false if not dateDifferenceGreaterThanTwoDays', () => {
    //                 const router = qRouter({
    //                     routes: {
    //                         initial: 'section1',
    //                         states: {
    //                             section1: {
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'section2'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             section2: {
    //                                 on: {
    //                                     ANSWER: [
    //                                         {
    //                                             target: 'section3',
    //                                             cond: [
    //                                                 'dateDifferenceGreaterThanTwoDays',
    //                                                 '$.answers.section1.q1.value',
    //                                                 '$.answers.section2.q1.value'
    //                                             ]
    //                                         },
    //                                         {
    //                                             target: 'section4'
    //                                         }
    //                                     ]
    //                                 }
    //                             },
    //                             section3: {},
    //                             section4: {}
    //                         }
    //                     }
    //                 });
    //                 router.next('ANSWER', {q1: '2015-02-01T00:00Z'});
    //                 const nextSectionId = router.next('ANSWER', {q1: '2015-02-02T00:00Z'}).id;

    //                 expect(nextSectionId).toEqual('section4');
    //             });
    //         });
    //     });
});
