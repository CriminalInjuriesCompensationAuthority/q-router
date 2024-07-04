'use strict';

const createParallelRouter = require('../lib/parallel');

describe('Parallel Router', () => {
    it('Should start at the defined starting state', () => {
        const parallelRouter = createParallelRouter({
            currentSectionId: 'a',
            routes: {
                id: 'parallel-routes-test',
                type: 'parallel',
                states: {
                    task1: {
                        initial: 'a',
                        currentSectionId: 'a',
                        states: {
                            a: {
                                type: 'final'
                            }
                        }
                    }
                }
            },
            attributes: {
                q__roles: {}
            }
        });

        const section = parallelRouter.current();

        expect(section.id).toEqual('a');
        expect(section.context.routes.states.task1.progress).toEqual(['a']);
    });

    it('should restart at the last saved state', () => {
        let section;
        const parallelRouter = createParallelRouter({
            currentSectionId: 'a',
            routes: {
                id: 'parallel-routes-test',
                type: 'parallel',
                states: {
                    task1: {
                        initial: 'a',
                        currentSectionId: 'a',
                        states: {
                            a: {
                                on: {
                                    ANSWER__A: 'b'
                                }
                            },
                            b: {
                                on: {
                                    ANSWER__B: 'c'
                                }
                            },
                            c: {
                                on: {
                                    ANSWER__C: 'd'
                                }
                            },
                            d: {
                                on: {
                                    ANSWER__D: 'e'
                                }
                            },
                            e: {
                                type: 'final'
                            }
                        }
                    }
                }
            },
            attributes: {
                q__roles: {}
            }
        });

        parallelRouter.next({}, 'a', 'ANSWER__A'); // b
        parallelRouter.next({}, 'b', 'ANSWER__B'); // c
        parallelRouter.next({}, 'c', 'ANSWER__C'); // d
        parallelRouter.next({}, 'd', 'ANSWER__D'); // e

        parallelRouter.previous('e'); // d
        section = parallelRouter.previous('d'); // c

        expect(section.id).toEqual('c');
        expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'c', 'd', 'e']);

        // Create a new router from the previous router's context and things should be the same
        const parallelRouter2 = createParallelRouter(section.context);

        section = parallelRouter2.current();

        expect(section.id).toEqual('c');
        expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    describe('Next', () => {
        it('should get the section from a machine by the supplied section id', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: [
                                            {
                                                target: 'b'
                                            }
                                        ]
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        },
                        task2: {
                            initial: 'c',
                            currentSectionId: 'c',
                            states: {
                                c: {
                                    on: {
                                        ANSWER__C: [
                                            {
                                                target: 'd'
                                            }
                                        ]
                                    }
                                },
                                d: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            const nextState = parallelRouter.next({}, 'c', 'ANSWER__C');
            expect(nextState.id).toBe('d');
        });

        it('should move to the next defined route', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            const section = parallelRouter.next({}, 'a', 'ANSWER__A');

            expect(section.id).toEqual('b');
            expect(section.context.routes.states.task1.progress).toEqual(['a', 'b']);
        });

        it('should return undefined if next attempts to advance to a section that has not been visited', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    on: {
                                        ANSWER__B: 'c'
                                    }
                                },
                                c: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            const section = parallelRouter.next({}, 'b', 'ANSWER__B');
            expect(section).toEqual(undefined);
        });

        it('should return undefined if next attempts to advance to a section that does not exist', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            const section = parallelRouter.next({}, 'c', 'ANSWER__C');
            expect(section).toEqual(undefined);
        });

        it('should move to the next defined route if permitted', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        },
                        'task1__applicability-status': {
                            initial: 'applicable',
                            currentSectionId: 'applicable',
                            states: {
                                applicable: {}
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            const section = parallelRouter.next({}, 'a', 'ANSWER__A');

            expect(section.id).toEqual('b');
            expect(section.context.routes.states.task1.progress).toEqual(['a', 'b']);
        });

        it('should not move to the next defined route if not permitted', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        },
                        'task1__applicability-status': {
                            initial: 'notApplicable',
                            currentSectionId: 'notApplicable',
                            states: {
                                notApplicable: {}
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            const section = parallelRouter.next({}, 'a', 'ANSWER__A');

            expect(section).toEqual(undefined);
        });

        it("should throw if trying to get route after the machine's last route", () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: [
                                            {
                                                target: 'b'
                                            }
                                        ]
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        },
                        task2: {
                            initial: 'c',
                            currentSectionId: 'c',
                            states: {
                                c: {
                                    on: {
                                        ANSWER__C: [
                                            {
                                                target: 'd'
                                            }
                                        ]
                                    }
                                },
                                d: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            parallelRouter.next({}, 'c', 'ANSWER__C'); // d
            expect(() => parallelRouter.next({}, 'd', 'ANSWER__D')).toThrow(
                'There are no next sections after section: "d"'
            );
        });

        describe('Machine as target', () => {
            it('Should get the current section of the target machine', () => {
                const parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER__A: [
                                                {
                                                    target: 'b'
                                                }
                                            ]
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER__B: [
                                                {
                                                    target: '#task2'
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            task2: {
                                initial: 'c',
                                currentSectionId: 'c',
                                states: {
                                    c: {
                                        on: {
                                            ANSWER__C: [
                                                {
                                                    target: 'd'
                                                }
                                            ]
                                        }
                                    },
                                    d: {
                                        type: 'final'
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    }
                });

                parallelRouter.next({}, 'a', 'ANSWER__A'); // b
                const section = parallelRouter.next({}, '#task2'); // task2 initial section "c".
                expect(section.id).toBe('c');
            });
        });
    });

    describe('Previous', () => {
        it('should get the section from a machine by the supplied section id', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: [
                                            {
                                                target: 'b'
                                            }
                                        ]
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        },
                        task2: {
                            initial: 'c',
                            currentSectionId: 'c',
                            states: {
                                c: {
                                    on: {
                                        ANSWER__C: [
                                            {
                                                target: 'd'
                                            }
                                        ]
                                    }
                                },
                                d: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            parallelRouter.next({}, 'c', 'ANSWER__C'); // d
            const section = parallelRouter.previous('d'); // c
            expect(section.id).toBe('c');
        });

        it('should move to the previous defined route', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            parallelRouter.next({}, 'a', 'ANSWER__A'); // b
            const section = parallelRouter.previous('b'); // a

            expect(section.id).toEqual('a');
            expect(section.context.routes.states.task1.progress).toEqual(['a', 'b']);
        });

        it('should return undefined if previous attempts to advance to a section that has not been visited', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            const section = parallelRouter.previous('b'); // attempting to go to 'a'
            expect(section).toEqual(undefined);
        });

        it('should move to the previous defined route if permitted', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'b',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'b',
                            progress: ['a', 'b'],
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        },
                        'task1__applicability-status': {
                            initial: 'applicable',
                            currentSectionId: 'applicable',
                            states: {
                                applicable: {}
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            const section = parallelRouter.previous('b');

            expect(section.id).toEqual('a');
            expect(section.context.routes.states.task1.progress).toEqual(['a', 'b']);
        });

        it('should not move to the previous defined route if not permitted', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'b',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'b',
                            progress: ['a', 'b'],
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        },
                        'task1__applicability-status': {
                            initial: 'notApplicable',
                            currentSectionId: 'notApplicable',
                            states: {
                                notApplicable: {}
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            const section = parallelRouter.previous('b');

            expect(section).toEqual(undefined);
        });

        it('should throw if trying to get route previous to initial route', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: [
                                            {
                                                target: 'b'
                                            }
                                        ]
                                    }
                                },
                                b: {
                                    type: 'final'
                                }
                            }
                        },
                        task2: {
                            initial: 'c',
                            currentSectionId: 'c',
                            states: {
                                c: {
                                    on: {
                                        ANSWER__C: [
                                            {
                                                target: 'd'
                                            }
                                        ]
                                    }
                                },
                                d: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            parallelRouter.next({}, 'c', 'ANSWER__C'); // d
            parallelRouter.previous('d'); // c
            expect(() => parallelRouter.previous('c')).toThrow(
                'There are no previous sections before section: "c"'
            );
        });

        describe('Referrer', () => {
            it('should route to the machine id defined in referrer when trying to get the route previous to initial route', () => {
                const parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER__A: [
                                                {
                                                    target: 'b'
                                                }
                                            ]
                                        }
                                    },
                                    b: {
                                        type: 'final'
                                    }
                                }
                            },
                            task2: {
                                referrer: '#task1',
                                initial: 'c',
                                currentSectionId: 'c',
                                states: {
                                    c: {
                                        on: {
                                            ANSWER__C: [
                                                {
                                                    target: 'd'
                                                }
                                            ]
                                        }
                                    },
                                    d: {
                                        type: 'final'
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    }
                });

                parallelRouter.next({}, 'c', 'ANSWER__C'); // d
                parallelRouter.previous('d'); // c
                parallelRouter.previous('c'); // #referrer

                const section = parallelRouter.current();

                expect(section.id).toEqual('a'); // #task1 machine.
            });
        });
    });

    describe('Current', () => {
        it('should get the current section', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    on: {
                                        ANSWER__B: 'c'
                                    }
                                },
                                c: {
                                    on: {
                                        ANSWER__C: 'd'
                                    }
                                },
                                d: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            parallelRouter.next({}, 'a', 'ANSWER__A'); // b
            parallelRouter.next({}, 'b', 'ANSWER__B'); // c
            parallelRouter.next({}, 'a', 'ANSWER__A'); // b

            const section = parallelRouter.current();

            expect(section.id).toEqual('b');
            expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'c']);
        });

        it('should set the current section', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    on: {
                                        ANSWER__B: 'c'
                                    }
                                },
                                c: {
                                    on: {
                                        ANSWER__C: 'd'
                                    }
                                },
                                d: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            parallelRouter.next({}, 'a', 'ANSWER__A'); // b
            parallelRouter.next({}, 'b', 'ANSWER__B'); // c

            const section = parallelRouter.current('a');

            expect(section.id).toEqual('a');
            expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'c']);
        });

        it('should return undefined if current() attempts to advance to a section that has not been visited', () => {
            const parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER__A: 'b'
                                    }
                                },
                                b: {
                                    on: {
                                        ANSWER__B: 'c'
                                    }
                                },
                                c: {
                                    on: {
                                        ANSWER__C: 'd'
                                    }
                                },
                                d: {
                                    type: 'final'
                                }
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            parallelRouter.next({}, 'a', 'ANSWER__A');

            const section = parallelRouter.current('c');

            expect(section).toEqual(undefined);
        });
    });

    describe('First', () => {
        describe('Single task machine', () => {
            it('should get the first section from the progress', () => {
                const parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER__A: 'b'
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER__B: 'c'
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER__C: 'd'
                                        }
                                    },
                                    d: {
                                        type: 'final'
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    }
                });

                parallelRouter.next({}, 'a', 'ANSWER__A'); // b
                parallelRouter.next({}, 'b', 'ANSWER__B'); // c

                const section = parallelRouter.first();

                expect(section.id).toEqual('a');
                expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'c']);
            });
        });
        describe('Multiple task machines', () => {
            it('should get the first section from the progress', () => {
                const parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER__A: 'b'
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER__B: 'c'
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER__C: 'd'
                                        }
                                    },
                                    d: {
                                        type: 'final'
                                    }
                                }
                            },
                            task2: {
                                initial: 'e',
                                currentSectionId: 'e',
                                progress: ['e', 'f', 'g'],
                                states: {
                                    e: {
                                        on: {
                                            ANSWER__E: 'f'
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER__F: 'g'
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER__G: 'h'
                                        }
                                    },
                                    h: {
                                        type: 'final'
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    }
                });

                parallelRouter.next({}, 'e', 'ANSWER__E'); // f
                parallelRouter.next({}, 'f', 'ANSWER__F'); // g
                const section = parallelRouter.first();

                expect(section.id).toEqual('e');
                expect(section.context.routes.states.task2.progress).toEqual(['e', 'f', 'g']);
            });
        });
    });

    describe('Last', () => {
        describe('Single task machine', () => {
            it('should get the last section from the progress', () => {
                const parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER__A: 'b'
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER__B: 'c'
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER__C: 'd'
                                        }
                                    },
                                    d: {
                                        type: 'final'
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    }
                });

                parallelRouter.next({}, 'a', 'ANSWER__A'); // b
                parallelRouter.next({}, 'b', 'ANSWER__B'); // c
                parallelRouter.next({}, 'a', 'ANSWER__A'); // b

                const section = parallelRouter.last();

                expect(section.id).toEqual('c');
                expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'c']);
            });
        });
        describe('Multiple task machine', () => {
            it('should get the last section from the progress', () => {
                const parallelRouter = createParallelRouter({
                    currentSectionId: 'g',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER__A: 'b'
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER__B: 'c'
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER__C: 'd'
                                        }
                                    },
                                    d: {
                                        type: 'final'
                                    }
                                }
                            },
                            task2: {
                                initial: 'e',
                                currentSectionId: 'g',
                                progress: ['e', 'f', 'g'],
                                states: {
                                    e: {
                                        on: {
                                            ANSWER__E: 'f'
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER__F: 'g'
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER__G: 'h'
                                        }
                                    },
                                    h: {
                                        type: 'final'
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    }
                });

                parallelRouter.next({}, 'e', 'ANSWER__E'); // f
                parallelRouter.next({}, 'f', 'ANSWER__F'); // g
                parallelRouter.next({}, 'g', 'ANSWER__G'); // h
                parallelRouter.next({}, 'e', 'ANSWER__E'); // f

                const section = parallelRouter.last();

                expect(section.id).toEqual('h');
                expect(section.context.routes.states.task2.progress).toEqual(['e', 'f', 'g', 'h']);
            });
        });
    });

    describe('Available', () => {
        describe('Single task machine', () => {
            it('should return true for section in the progress', () => {
                const parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER__A: 'b'
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER__B: 'c'
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER__C: 'd'
                                        }
                                    },
                                    d: {
                                        type: 'final'
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    }
                });

                parallelRouter.next({}, 'a', 'ANSWER__A'); // b
                parallelRouter.next({}, 'b', 'ANSWER__B'); // c

                const isAvailable = parallelRouter.available('b');

                expect(isAvailable).toEqual(true);
            });

            it('should return false for section not in the progress', () => {
                const parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER__A: 'b'
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER__B: 'c'
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER__C: 'd'
                                        }
                                    },
                                    d: {
                                        type: 'final'
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    }
                });

                parallelRouter.next({}, 'a', 'ANSWER__A'); // b
                parallelRouter.next({}, 'b', 'ANSWER__B'); // c

                const isAvailable = parallelRouter.available('d');

                expect(isAvailable).toEqual(false);
            });
        });
        describe('Multiple task machines', () => {
            it('should return true for section in the progresses', () => {
                const parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER__A: 'b'
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER__B: 'c'
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER__C: 'd'
                                        }
                                    },
                                    d: {
                                        type: 'final'
                                    }
                                }
                            },
                            task2: {
                                initial: 'e',
                                currentSectionId: 'e',
                                states: {
                                    e: {
                                        on: {
                                            ANSWER__E: 'f'
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER__F: 'g'
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER__G: 'h'
                                        }
                                    },
                                    h: {
                                        type: 'final'
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    }
                });

                parallelRouter.next({}, 'e', 'ANSWER__E'); // f
                parallelRouter.next({}, 'f', 'ANSWER__F'); // g

                const isAvailableA = parallelRouter.available('a');
                const isAvailableB = parallelRouter.available('f');

                expect(isAvailableA).toEqual(true);
                expect(isAvailableB).toEqual(true);
            });

            it('should return false for section in the progresses', () => {
                const parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER__A: 'b'
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER__B: 'c'
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER__C: 'd'
                                        }
                                    },
                                    d: {
                                        type: 'final'
                                    }
                                }
                            },
                            task2: {
                                initial: 'e',
                                currentSectionId: 'e',
                                states: {
                                    e: {
                                        on: {
                                            ANSWER__E: 'f'
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER__F: 'g'
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER__G: 'h'
                                        }
                                    },
                                    h: {
                                        type: 'final'
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    }
                });

                parallelRouter.next({}, 'a', 'ANSWER__A'); // b
                parallelRouter.next({}, 'e', 'ANSWER__E'); // f
                parallelRouter.next({}, 'f', 'ANSWER__F'); // g

                const isAvailableA = parallelRouter.available('c');
                const isAvailableB = parallelRouter.available('h');

                expect(isAvailableA).toEqual(false);
                expect(isAvailableB).toEqual(false);
            });

            it('should return true and false for section in the progresses', () => {
                const parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER__A: 'b'
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER__B: 'c'
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER__C: 'd'
                                        }
                                    },
                                    d: {
                                        type: 'final'
                                    }
                                }
                            },
                            task2: {
                                initial: 'e',
                                currentSectionId: 'e',
                                states: {
                                    e: {
                                        on: {
                                            ANSWER__E: 'f'
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER__F: 'g'
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER__G: 'h'
                                        }
                                    },
                                    h: {
                                        type: 'final'
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    }
                });

                parallelRouter.next({}, 'a', 'ANSWER__A'); // b
                parallelRouter.next({}, 'b', 'ANSWER__B'); // c
                parallelRouter.next({}, 'e', 'ANSWER__E'); // f

                const isAvailableA = parallelRouter.available('a');
                const isAvailableB = parallelRouter.available('g');

                expect(isAvailableA).toEqual(true);
                expect(isAvailableB).toEqual(false);
            });
        });
    });
});
