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
                }
            },
            attributes: {
                q__roles: {}
            }
        });

        parallelRouter.next({}, 'a', 'ANSWER'); // b
        parallelRouter.next({}, 'b', 'ANSWER'); // c
        parallelRouter.next({}, 'c', 'ANSWER'); // d
        parallelRouter.next({}, 'd', 'ANSWER'); // e

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
                                        ANSWER: [
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
                                        ANSWER: [
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

            const nextState = parallelRouter.next({}, 'c', 'ANSWER');
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
                                        ANSWER: 'b'
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

            const section = parallelRouter.next({}, 'a', 'ANSWER');

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
                    }
                },
                attributes: {
                    q__roles: {}
                }
            });

            const section = parallelRouter.next({}, 'b', 'ANSWER');
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
                                        ANSWER: 'b'
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

            const section = parallelRouter.next({}, 'c', 'ANSWER');
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
                                        ANSWER: [
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
                                        ANSWER: [
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

            parallelRouter.next({}, 'c', 'ANSWER'); // d
            expect(() => parallelRouter.next({}, 'd', 'ANSWER')).toThrow(
                'There are no next sections after section: "d"'
            );
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
                                        ANSWER: [
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
                                        ANSWER: [
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

            parallelRouter.next({}, 'c', 'ANSWER'); // d
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
                                        ANSWER: 'b'
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

            parallelRouter.next({}, 'a', 'ANSWER'); // b
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
                                        ANSWER: 'b'
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
                                        ANSWER: [
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
                                        ANSWER: [
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

            parallelRouter.next({}, 'c', 'ANSWER'); // d
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
                                            ANSWER: [
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
                                            ANSWER: [
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

                parallelRouter.next({}, 'c', 'ANSWER'); // d
                parallelRouter.previous('d'); // c
                parallelRouter.previous('c'); // #referrer

                const section = parallelRouter.current();

                expect(section.id).toEqual('a'); // #task1 machine.
            });

            it('should retain the progress of the machine is routed from', () => {
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
                                            ANSWER: [
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
                                            ANSWER: [
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

                parallelRouter.next({}, 'c', 'ANSWER'); // d
                parallelRouter.previous('d'); // c
                parallelRouter.previous('c'); // #referrer

                const section = parallelRouter.current();

                expect(section.id).toEqual('a'); // #task1 machine.
                expect(section.context.routes.states.task2.progress).toEqual(['c', 'd']);
            });
        });
    });

    describe('Current', () => {
        it('should get the current section', () => {
            let parallelRouter = createParallelRouter({
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

            let section = parallelRouter.next({}, 'a', 'ANSWER'); // b
            expect(section.id).toEqual('b');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.current();
            expect(section.id).toEqual('b');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.next({}, 'b', 'ANSWER'); // c
            expect(section.id).toEqual('c');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.current();
            expect(section.id).toEqual('c');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.next({}, 'a', 'ANSWER'); // b
            expect(section.id).toEqual('b');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.current();
            expect(section.id).toEqual('b');

            expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'c']);
        });

        it('should set the current section', () => {
            let parallelRouter = createParallelRouter({
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

            let section = parallelRouter.next({}, 'a', 'ANSWER'); // b
            expect(section.id).toEqual('b');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.next({}, 'b', 'ANSWER'); // c
            expect(section.id).toEqual('c');

            section = parallelRouter.current('a');
            expect(section.id).toEqual('a');
            expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'c']);
        });

        it('should return undefined if current() attempts to advance to a section that has not been visited', () => {
            let parallelRouter = createParallelRouter({
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

            let section = parallelRouter.next({}, 'a', 'ANSWER');
            section = parallelRouter.current('b');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.current('c');

            expect(section).toEqual(undefined);
        });
    });

    describe('First', () => {
        describe('Single task machine', () => {
            it('should get the first section from the progress', () => {
                let parallelRouter = createParallelRouter({
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

                let section = parallelRouter.next({}, 'a', 'ANSWER'); // b
                expect(section.id).toEqual('b');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'b', 'ANSWER'); // c
                expect(section.id).toEqual('c');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.first();
                expect(section.id).toEqual('a');
                expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'c']);
            });
        });
        describe('Multiple task machines', () => {
            it('should get the first section from the progress', () => {
                let parallelRouter = createParallelRouter({
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
                                            ANSWER: 'f'
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER: 'g'
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER: 'h'
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

                let section = parallelRouter.next({}, 'e', 'ANSWER'); // f
                expect(section.id).toEqual('f');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'f', 'ANSWER'); // g
                expect(section.id).toEqual('g');

                section = parallelRouter.first();
                expect(section.id).toEqual('e');
                expect(section.context.routes.states.task2.progress).toEqual(['e', 'f', 'g']);
            });
        });
    });

    describe('Last', () => {
        describe('Single task machine', () => {
            it('should get the last section from the progress', () => {
                let parallelRouter = createParallelRouter({
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

                let section = parallelRouter.next({}, 'a', 'ANSWER'); // b
                expect(section.id).toEqual('b');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'b', 'ANSWER'); // c
                expect(section.id).toEqual('c');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'a', 'ANSWER'); // b
                expect(section.id).toEqual('b');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.last();
                expect(section.id).toEqual('c');
                expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'c']);
            });
        });
        describe('Multiple task machine', () => {
            it('should get the last section from the progress', () => {
                let parallelRouter = createParallelRouter({
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
                                            ANSWER: 'f'
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER: 'g'
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER: 'h'
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

                let section = parallelRouter.next({}, 'e', 'ANSWER'); // f
                expect(section.id).toEqual('f');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'f', 'ANSWER'); // g
                expect(section.id).toEqual('g');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'g', 'ANSWER'); // h
                expect(section.id).toEqual('h');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'e', 'ANSWER'); // f
                expect(section.id).toEqual('f');

                section = parallelRouter.last();
                expect(section.id).toEqual('h');
                expect(section.context.routes.states.task2.progress).toEqual(['e', 'f', 'g', 'h']);
            });
        });
    });

    describe('Available', () => {
        describe('Single task machine', () => {
            it('should return true for section in the progress', () => {
                let parallelRouter = createParallelRouter({
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

                let section = parallelRouter.next({}, 'a', 'ANSWER'); // b
                expect(section.id).toEqual('b');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'b', 'ANSWER'); // c
                expect(section.id).toEqual('c');

                parallelRouter = createParallelRouter(section.context);
                const isAvailable = parallelRouter.available('b');
                expect(isAvailable).toEqual(true);
            });

            it('should return false for section not in the progress', () => {
                let parallelRouter = createParallelRouter({
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

                let section = parallelRouter.next({}, 'a', 'ANSWER'); // b
                expect(section.id).toEqual('b');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'b', 'ANSWER'); // c
                expect(section.id).toEqual('c');

                parallelRouter = createParallelRouter(section.context);
                const isAvailable = parallelRouter.available('d');
                expect(isAvailable).toEqual(false);
            });
        });
        describe('Multiple task machines', () => {
            it('should return true for section in the progresses', () => {
                let parallelRouter = createParallelRouter({
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
                                            ANSWER: 'f'
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER: 'g'
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER: 'h'
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

                let section = parallelRouter.next({}, 'e', 'ANSWER'); // f
                expect(section.id).toEqual('f');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'f', 'ANSWER'); // g
                expect(section.id).toEqual('g');

                parallelRouter = createParallelRouter(section.context);
                const isAvailableA = parallelRouter.available('a');
                parallelRouter = createParallelRouter(section.context); // verbosity.
                const isAvailableB = parallelRouter.available('f');

                expect(isAvailableA).toEqual(true);
                expect(isAvailableB).toEqual(true);
            });

            it('should return false for section in the progresses', () => {
                let parallelRouter = createParallelRouter({
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
                                            ANSWER: 'f'
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER: 'g'
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER: 'h'
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

                let section = parallelRouter.next({}, 'a', 'ANSWER'); // b
                expect(section.id).toEqual('b');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'e', 'ANSWER'); // f
                expect(section.id).toEqual('f');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'f', 'ANSWER'); // g
                expect(section.id).toEqual('g');

                parallelRouter = createParallelRouter(section.context);
                const isAvailableA = parallelRouter.available('c');
                parallelRouter = createParallelRouter(section.context); // verbosity.
                const isAvailableB = parallelRouter.available('h');

                expect(isAvailableA).toEqual(false);
                expect(isAvailableB).toEqual(false);
            });

            it('should return true and false for section in the progresses', () => {
                let parallelRouter = createParallelRouter({
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
                                            ANSWER: 'f'
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER: 'g'
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER: 'h'
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

                let section = parallelRouter.next({}, 'a', 'ANSWER'); // b
                expect(section.id).toEqual('b');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'b', 'ANSWER'); // c
                expect(section.id).toEqual('c');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'e', 'ANSWER'); // f
                expect(section.id).toEqual('f');

                parallelRouter = createParallelRouter(section.context);
                const isAvailableA = parallelRouter.available('a');
                parallelRouter = createParallelRouter(section.context); // verbosity.
                const isAvailableB = parallelRouter.available('g');

                expect(isAvailableA).toEqual(true);
                expect(isAvailableB).toEqual(false);
            });
        });
    });

    describe('Applicability Status machine', () => {
        it('should update the applicability status via the "ANSWER" event', () => {
            let parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            id: 'task1',
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'b'
                                            }
                                        ]
                                    }
                                },
                                b: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: '#task2'
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        task2: {
                            id: 'task2',
                            initial: 'c',
                            currentSectionId: 'c',
                            states: {
                                c: {
                                    on: {
                                        ANSWER: [
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
                        },
                        'task1__applicability-status': {
                            initial: 'applicable',
                            currentSectionId: 'applicable',
                            states: {
                                applicable: {}
                            }
                        },
                        'task2__applicability-status': {
                            initial: 'notApplicable',
                            currentSectionId: 'notApplicable',
                            states: {
                                notApplicable: {
                                    on: {
                                        UPDATE__STATUS: [
                                            {
                                                target: 'applicable'
                                            }
                                        ]
                                    }
                                },
                                applicable: {}
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {}
                },
                answers: {}
            });

            let section = parallelRouter.current();
            expect(section.value['task2__applicability-status']).toEqual('notApplicable');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.next({}, 'a', 'ANSWER');
            expect(section.id).toBe('b');
            expect(section.value['task2__applicability-status']).toEqual('applicable');
        });

        it('should not update the applicability status via the ANSWER event given certain roles', () => {
            let parallelRouter = createParallelRouter({
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
                                        ANSWER: [
                                            {
                                                target: 'b'
                                            }
                                        ]
                                    }
                                },
                                b: {
                                    on: {
                                        ANSWER: [
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
                                        ANSWER: [
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
                        },
                        'task1__applicability-status': {
                            initial: 'applicable',
                            currentSectionId: 'applicable',
                            states: {
                                applicable: {}
                            }
                        },
                        'task2__applicability-status': {
                            initial: 'notApplicable',
                            currentSectionId: 'notApplicable',
                            states: {
                                notApplicable: {
                                    on: {
                                        UPDATE__STATUS: [
                                            {
                                                target: 'applicable',
                                                cond: ['|role.all', 'role1']
                                            },
                                            {
                                                target: 'notApplicable'
                                            }
                                        ]
                                    }
                                },
                                applicable: {}
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {
                        role1: {
                            schema: {
                                $schema: 'http://json-schema.org/draft-07/schema#',
                                title: 'Role 1',
                                type: 'boolean',
                                const: ['==', '$.answers.a.q1', 'foo'],
                                examples: [{}],
                                invalidExamples: [{}]
                            }
                        },
                        role2: {
                            schema: {
                                $schema: 'http://json-schema.org/draft-07/schema#',
                                title: 'Role 2',
                                type: 'boolean',
                                const: ['==', '$.answers.a.q1', 'bar'],
                                examples: [{}],
                                invalidExamples: [{}]
                            }
                        }
                    }
                },
                answers: {}
            });

            let section = parallelRouter.current();
            expect(section.value['task2__applicability-status']).toEqual('notApplicable');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.next({q1: 'bar'}, 'a', 'ANSWER');
            expect(section.id).toBe('b');
            expect(section.value['task2__applicability-status']).toEqual('notApplicable');
        });

        it('should conditionally route to a machine', () => {
            let parallelRouter = createParallelRouter({
                currentSectionId: 'a',
                routes: {
                    id: 'parallel-routes-test',
                    type: 'parallel',
                    states: {
                        task1: {
                            id: 'task1',
                            initial: 'a',
                            currentSectionId: 'a',
                            states: {
                                a: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'b',
                                                cond: ['==', '$.answers.a.q1', 'foo']
                                            },
                                            {
                                                target: 'c',
                                                cond: ['==', '$.answers.a.q1', 'bar']
                                            }
                                        ]
                                    }
                                },
                                b: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'd'
                                            }
                                        ]
                                    }
                                },
                                c: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'd'
                                            }
                                        ]
                                    }
                                },
                                d: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: '#task2',
                                                cond: ['|role.all', 'role1']
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        task2: {
                            initial: 'e',
                            currentSectionId: 'e',
                            states: {
                                e: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'f'
                                            }
                                        ]
                                    }
                                },
                                f: {
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
                        },
                        'task2__applicability-status': {
                            initial: 'notApplicable',
                            currentSectionId: 'notApplicable',
                            states: {
                                notApplicable: {
                                    on: {
                                        UPDATE__STATUS: [
                                            {
                                                target: 'applicable',
                                                cond: ['|role.all', 'role1']
                                            },
                                            {
                                                target: 'notApplicable'
                                            }
                                        ]
                                    }
                                },
                                applicable: {}
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {
                        role1: {
                            schema: {
                                $schema: 'http://json-schema.org/draft-07/schema#',
                                title: 'Role 1',
                                type: 'boolean',
                                const: ['==', '$.answers.b.q1', true],
                                examples: [{}],
                                invalidExamples: [{}]
                            }
                        },
                        role2: {
                            schema: {
                                $schema: 'http://json-schema.org/draft-07/schema#',
                                title: 'Role 2',
                                type: 'boolean',
                                const: ['==', '$.answers.c.q1', true],
                                examples: [{}],
                                invalidExamples: [{}]
                            }
                        }
                    }
                },
                answers: {}
            });

            let section = parallelRouter.current();
            expect(section.value['task2__applicability-status']).toEqual('notApplicable');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.next({q1: 'foo'}, 'a', 'ANSWER'); // b
            expect(section.id).toEqual('b');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.next({q1: true}, 'b', 'ANSWER'); // d
            expect(section.id).toEqual('d');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.next({}, 'd', 'ANSWER'); // #task2.e
            expect(section.value['task2__applicability-status']).toEqual('applicable');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.current();
            expect(section.id).toEqual('e');
        });

        it('should conditionally skip a machine', () => {
            let parallelRouter = createParallelRouter({
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
                                        ANSWER: [
                                            {
                                                target: 'b',
                                                cond: ['==', '$.answers.a.q1', 'foo']
                                            },
                                            {
                                                target: 'c',
                                                cond: ['==', '$.answers.a.q1', 'bar']
                                            }
                                        ]
                                    }
                                },
                                b: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'd'
                                            }
                                        ]
                                    }
                                },
                                c: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'd'
                                            }
                                        ]
                                    }
                                },
                                d: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: '#task2',
                                                cond: ['|role.all', 'role2']
                                            },
                                            {
                                                target: '#task3'
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        task2: {
                            initial: 'e',
                            currentSectionId: 'e',
                            states: {
                                e: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'f'
                                            }
                                        ]
                                    }
                                },
                                f: {
                                    type: 'final'
                                }
                            }
                        },
                        task3: {
                            initial: 'g',
                            currentSectionId: 'g',
                            states: {
                                g: {
                                    on: {
                                        ANSWER: [
                                            {
                                                target: 'h'
                                            }
                                        ]
                                    }
                                },
                                h: {
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
                        },
                        'task2__applicability-status': {
                            initial: 'notApplicable',
                            currentSectionId: 'notApplicable',
                            states: {
                                notApplicable: {
                                    on: {
                                        UPDATE__STATUS: [
                                            {
                                                target: 'applicable',
                                                cond: ['|role.all', 'role2']
                                            },
                                            {
                                                target: 'notApplicable'
                                            }
                                        ]
                                    }
                                },
                                applicable: {}
                            }
                        },
                        'task3__applicability-status': {
                            initial: 'applicable',
                            currentSectionId: 'applicable',
                            states: {
                                applicable: {}
                            }
                        }
                    }
                },
                attributes: {
                    q__roles: {
                        role1: {
                            schema: {
                                $schema: 'http://json-schema.org/draft-07/schema#',
                                title: 'Role 1',
                                type: 'boolean',
                                const: ['==', '$.answers.b.q1', true],
                                examples: [{}],
                                invalidExamples: [{}]
                            }
                        },
                        role2: {
                            schema: {
                                $schema: 'http://json-schema.org/draft-07/schema#',
                                title: 'Role 2',
                                type: 'boolean',
                                const: ['==', '$.answers.c.q1', true],
                                examples: [{}],
                                invalidExamples: [{}]
                            }
                        }
                    }
                },
                answers: {}
            });

            let section = parallelRouter.current();
            expect(section.value['task2__applicability-status']).toEqual('notApplicable');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.next({q1: 'foo'}, 'a', 'ANSWER');
            expect(section.id).toEqual('b');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.next({q1: true}, 'b', 'ANSWER');
            expect(section.id).toEqual('d');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.next({}, 'd', 'ANSWER');
            expect(section.id).toEqual('g');
            expect(section.value['task2__applicability-status']).toEqual('notApplicable');

            parallelRouter = createParallelRouter(section.context);
            section = parallelRouter.current();
            expect(section.id).toEqual('g');
        });

        describe('applicability via roles', () => {
            it('should update a status from "cannotStartYet" to "applicable" if role is satisfied', () => {
                let parallelRouter = createParallelRouter({
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
                                            ANSWER: [
                                                {
                                                    target: 'b'
                                                }
                                            ]
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'c'
                                                }
                                            ]
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: '#task2'
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            task2: {
                                initial: 'd',
                                currentSectionId: 'd',
                                states: {
                                    d: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'e'
                                                }
                                            ]
                                        }
                                    },
                                    e: {
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
                            },
                            'task2__applicability-status': {
                                initial: 'cannotStartYet',
                                currentSectionId: 'cannotStartYet',
                                states: {
                                    cannotStartYet: {
                                        on: {
                                            UPDATE__STATUS: [
                                                {
                                                    target: 'applicable',
                                                    cond: ['|role.all', 'role1']
                                                },
                                                {
                                                    target: 'cannotStartYet'
                                                }
                                            ]
                                        }
                                    },
                                    applicable: {}
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {
                            role1: {
                                schema: {
                                    $schema: 'http://json-schema.org/draft-07/schema#',
                                    title: 'Role 1',
                                    type: 'boolean',
                                    const: ['==', '$.answers.a.q1', 'foo'],
                                    examples: [{}],
                                    invalidExamples: [{}]
                                }
                            },
                            role2: {
                                schema: {
                                    $schema: 'http://json-schema.org/draft-07/schema#',
                                    title: 'Role 2',
                                    type: 'boolean',
                                    const: ['==', '$.answers.a.q1', 'bar'],
                                    examples: [{}],
                                    invalidExamples: [{}]
                                }
                            }
                        }
                    },
                    answers: {}
                });

                let section = parallelRouter.current();
                expect(section.value['task2__applicability-status']).toEqual('cannotStartYet');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 'foo'}, 'a', 'ANSWER');
                expect(section.id).toEqual('b');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: true}, 'b', 'ANSWER');
                expect(section.id).toEqual('c');
                expect(section.id).toBe('c');
                expect(section.value['task2__applicability-status']).toEqual('applicable');
            });

            it('should update a status from "applicable" to "cannotStartYet" if roles become unsatisfied due to a cascade', () => {
                let parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                id: 'task1',
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'b',
                                                    cond: ['|role.all', 'role1']
                                                },
                                                {
                                                    target: 'c',
                                                    cond: ['|role.all', 'role2']
                                                }
                                            ]
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'c'
                                                }
                                            ]
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: '#task2'
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            task2: {
                                id: 'task2',
                                initial: 'd',
                                currentSectionId: 'd',
                                states: {
                                    d: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'e'
                                                }
                                            ]
                                        }
                                    },
                                    e: {
                                        type: 'final'
                                    }
                                }
                            },
                            'task1__applicability-status': {
                                id: 'task1__applicability-status',
                                initial: 'applicable',
                                currentSectionId: 'applicable',
                                states: {
                                    applicable: {}
                                }
                            },
                            'task2__applicability-status': {
                                id: 'task2__applicability-status',
                                initial: 'cannotStartYet',
                                currentSectionId: 'cannotStartYet',
                                states: {
                                    cannotStartYet: {
                                        on: {
                                            UPDATE__STATUS: [
                                                {
                                                    target: 'applicable',
                                                    cond: ['|role.all', 'role1']
                                                },
                                                {
                                                    target: 'cannotStartYet'
                                                }
                                            ]
                                        }
                                    },
                                    applicable: {
                                        on: {
                                            CASCADE__TASK1: [
                                                {
                                                    target: 'cannotStartYet'
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {
                            role1: {
                                schema: {
                                    $schema: 'http://json-schema.org/draft-07/schema#',
                                    title: 'Role 1',
                                    type: 'boolean',
                                    const: ['==', '$.answers.a.q1', 'foo'],
                                    examples: [{}],
                                    invalidExamples: [{}]
                                }
                            },
                            role2: {
                                schema: {
                                    $schema: 'http://json-schema.org/draft-07/schema#',
                                    title: 'Role 2',
                                    type: 'boolean',
                                    const: ['==', '$.answers.a.q1', 'bar'],
                                    examples: [{}],
                                    invalidExamples: [{}]
                                }
                            }
                        }
                    },
                    answers: {}
                });

                let section = parallelRouter.current();
                expect(section.value['task2__applicability-status']).toEqual('cannotStartYet');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 'foo'}, 'a', 'ANSWER');
                expect(section.id).toEqual('b');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'b', 'ANSWER');
                expect(section.id).toBe('c');
                expect(section.value['task2__applicability-status']).toEqual('applicable');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 'bar'}, 'a', 'ANSWER');
                expect(section.value['task2__applicability-status']).toEqual('cannotStartYet');
            });
        });

        describe('applicability via conds', () => {
            it('should update a status from "cannotStartYet" to "applicable" if role is satisfied', () => {
                let parallelRouter = createParallelRouter({
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
                                            ANSWER: [
                                                {
                                                    target: 'b'
                                                }
                                            ]
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'c'
                                                }
                                            ]
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: '#task2'
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            task2: {
                                initial: 'd',
                                currentSectionId: 'd',
                                states: {
                                    d: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'e'
                                                }
                                            ]
                                        }
                                    },
                                    e: {
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
                            },
                            'task2__applicability-status': {
                                initial: 'cannotStartYet',
                                currentSectionId: 'cannotStartYet',
                                states: {
                                    cannotStartYet: {
                                        on: {
                                            UPDATE__STATUS: [
                                                {
                                                    target: 'applicable',
                                                    cond: ['==', '$.answers.a.q1', 'foo']
                                                },
                                                {
                                                    target: 'cannotStartYet'
                                                }
                                            ]
                                        }
                                    },
                                    applicable: {}
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    },
                    answers: {}
                });

                let section = parallelRouter.current();
                expect(section.value['task2__applicability-status']).toEqual('cannotStartYet');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 'foo'}, 'a', 'ANSWER');
                expect(section.id).toEqual('b');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: true}, 'b', 'ANSWER');
                expect(section.id).toBe('c');
                expect(section.value['task2__applicability-status']).toEqual('applicable');
            });

            it('should update a status from "applicable" to "cannotStartYet" if roles become unsatisfied due to a cascade', () => {
                let parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                id: 'task1',
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'b',
                                                    cond: ['==', '$.answers.a.q1', 'foo']
                                                },
                                                {
                                                    target: 'c',
                                                    cond: ['==', '$.answers.a.q1', 'bar']
                                                }
                                            ]
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'c'
                                                }
                                            ]
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: '#task2'
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            task2: {
                                id: 'task2',
                                initial: 'd',
                                currentSectionId: 'd',
                                states: {
                                    d: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'e'
                                                }
                                            ]
                                        }
                                    },
                                    e: {
                                        type: 'final'
                                    }
                                }
                            },
                            'task1__applicability-status': {
                                id: 'task1__applicability-status',
                                initial: 'applicable',
                                currentSectionId: 'applicable',
                                states: {
                                    applicable: {}
                                }
                            },
                            'task2__applicability-status': {
                                id: 'task2__applicability-status',
                                initial: 'cannotStartYet',
                                currentSectionId: 'cannotStartYet',
                                states: {
                                    cannotStartYet: {
                                        on: {
                                            UPDATE__STATUS: [
                                                {
                                                    target: 'applicable',
                                                    cond: ['==', '$.answers.a.q1', 'foo']
                                                },
                                                {
                                                    target: 'cannotStartYet'
                                                }
                                            ]
                                        }
                                    },
                                    applicable: {
                                        on: {
                                            CASCADE__TASK1: [
                                                {
                                                    target: 'cannotStartYet'
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {}
                    },
                    answers: {}
                });

                let section = parallelRouter.current();
                expect(section.value['task2__applicability-status']).toEqual('cannotStartYet');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 'foo'}, 'a', 'ANSWER');
                expect(section.id).toEqual('b');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'b', 'ANSWER');
                expect(section.id).toEqual('c');
                expect(section.value['task2__applicability-status']).toEqual('applicable');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 'bar'}, 'a', 'ANSWER');
                expect(section.value['task2__applicability-status']).toEqual('cannotStartYet');
            });
        });

        describe('Multi-machine cascade', () => {
            it('should retract answers and cause a multi-machines-wide cascade', () => {
                let parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                id: 'task1',
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'b',
                                                    cond: ['==', '$.answers.a.q1', 'foo']
                                                },
                                                {
                                                    target: 'c',
                                                    cond: ['==', '$.answers.a.q1', 'bar']
                                                }
                                            ]
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'd'
                                                }
                                            ]
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'd'
                                                }
                                            ]
                                        }
                                    },
                                    d: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: '#task2'
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            task2: {
                                id: 'task2',
                                initial: 'e',
                                currentSectionId: 'e',
                                states: {
                                    e: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'f'
                                                }
                                            ]
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'g',
                                                    cond: ['==', '$.answers.b.q1', 1]
                                                },
                                                {
                                                    target: 'h',
                                                    cond: ['==', '$.answers.c.q1', 1]
                                                }
                                            ]
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'h'
                                                }
                                            ]
                                        }
                                    },
                                    h: {
                                        type: 'final'
                                    }
                                }
                            },
                            'task1__applicability-status': {
                                id: 'task1__applicability-status',
                                initial: 'applicable',
                                currentSectionId: 'applicable',
                                states: {
                                    applicable: {}
                                }
                            },
                            'task2__applicability-status': {
                                id: 'task2__applicability-status',
                                initial: 'notApplicable',
                                currentSectionId: 'notApplicable',
                                states: {
                                    notApplicable: {
                                        on: {
                                            UPDATE__STATUS: [
                                                {
                                                    target: 'applicable',
                                                    cond: ['|role.all', 'role1']
                                                },
                                                {
                                                    target: 'notApplicable'
                                                }
                                            ]
                                        }
                                    },
                                    applicable: {
                                        on: {
                                            CASCADE__TASK1: [
                                                {
                                                    target: 'notApplicable'
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {
                            role1: {
                                schema: {
                                    $schema: 'http://json-schema.org/draft-07/schema#',
                                    title: 'Role 1',
                                    type: 'boolean',
                                    const: ['==', '$.answers.a.q1', 'foo'],
                                    examples: [{}],
                                    invalidExamples: [{}]
                                }
                            }
                        }
                    },
                    answers: {}
                });

                let section = parallelRouter.current();
                expect(section.value['task2__applicability-status']).toEqual('notApplicable');
                expect(section.context.routes.states.task1.progress).toEqual(['a']);

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 'foo'}, 'a', 'ANSWER'); // b.
                expect(section.value['task2__applicability-status']).toEqual('applicable');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 1}, 'b', 'ANSWER'); // d.
                expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'd']);

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'd', 'ANSWER'); // #task2.e
                expect(section.context.routes.states.task2.progress).toEqual(['e']);

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'e', 'ANSWER'); // f.
                expect(section.id).toEqual('f');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'f', 'ANSWER'); // g. has routing dependency on b
                expect(section.id).toEqual('g');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'g', 'ANSWER'); // h.
                expect(section.id).toEqual('h');

                // re-answer the first question in task1. this answer makes role1 irrelevant.
                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 'bar'}, 'a', 'ANSWER');
                expect(section.id).toEqual('c');
                expect(section.context.routes.states.task1.progress).toEqual(['a', 'c']);
                expect(section.context.routes.states.task2.progress).toEqual(['e', 'f']);
                expect(section.value['task2__applicability-status']).toEqual('notApplicable');
            });
        });
    });

    describe('Completion status machine', () => {
        describe('events', () => {
            describe('COMPLETE__{{TASK_ID}}', () => {
                describe('state target is machine id', () => {
                    it('should update a tasks completion status to "complete" on transition', () => {
                        let parallelRouter = createParallelRouter({
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
                                                    ANSWER: [
                                                        {
                                                            target: 'b'
                                                        }
                                                    ]
                                                }
                                            },
                                            b: {
                                                on: {
                                                    ANSWER: [
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
                                                    ANSWER: [
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
                                    },
                                    'task1__completion-status': {
                                        initial: 'incomplete',
                                        currentSectionId: 'incomplete',
                                        states: {
                                            incomplete: {
                                                on: {
                                                    COMPLETE__TASK1: 'completed'
                                                }
                                            },
                                            completed: {}
                                        }
                                    },
                                    'task2__completion-status': {
                                        initial: 'incomplete',
                                        currentSectionId: 'incomplete',
                                        states: {
                                            incomplete: {
                                                on: {
                                                    COMPLETE__TASK2: 'completed'
                                                }
                                            },
                                            completed: {}
                                        }
                                    }
                                }
                            },
                            attributes: {
                                q__roles: {}
                            },
                            answers: {}
                        });

                        let section = parallelRouter.current();
                        expect(section.value['task1__completion-status']).toEqual('incomplete');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({}, 'a', 'ANSWER'); // b
                        expect(section.id).toBe('b');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({}, 'b', 'ANSWER'); // #task2.c
                        expect(section.id).toBe('c');
                        expect(section.value['task1__completion-status']).toEqual('completed');
                    });
                });
            });
            describe('CASCADE__{{TASK_ID}}', () => {
                describe('state target is machine id', () => {
                    it('should update the completion status to "complete" then "incomplete"', () => {
                        let parallelRouter = createParallelRouter({
                            currentSectionId: 'a',
                            routes: {
                                id: 'parallel-routes-test',
                                type: 'parallel',
                                states: {
                                    task1: {
                                        id: 'task1',
                                        initial: 'a',
                                        currentSectionId: 'a',
                                        states: {
                                            a: {
                                                // mirrors residency and nationality questions.
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: 'b',
                                                            cond: ['==', '$.answers.a.q1', false]
                                                        },
                                                        {
                                                            target: '#task2'
                                                        }
                                                    ]
                                                }
                                            },
                                            b: {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: 'c',
                                                            cond: ['==', '$.answers.b.q1', false]
                                                        },
                                                        {
                                                            target: '#task2'
                                                        }
                                                    ]
                                                }
                                            },
                                            c: {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: 'd',
                                                            cond: ['==', '$.answers.c.q1', false]
                                                        },
                                                        {
                                                            target: '#task2'
                                                        }
                                                    ]
                                                }
                                            },
                                            d: {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: '#task2'
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    task2: {
                                        id: 'task2',
                                        initial: 'e',
                                        currentSectionId: 'e',
                                        states: {
                                            e: {
                                                type: 'final'
                                            }
                                        }
                                    },
                                    'task1__completion-status': {
                                        id: 'task1__completion-status',
                                        initial: 'incomplete',
                                        currentSectionId: 'incomplete',
                                        states: {
                                            incomplete: {
                                                on: {
                                                    COMPLETE__TASK1: [
                                                        {
                                                            target: 'completed'
                                                        }
                                                    ]
                                                }
                                            },
                                            completed: {
                                                on: {
                                                    CASCADE__TASK1: 'incomplete'
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            attributes: {
                                q__roles: {}
                            },
                            answers: {}
                        });

                        let section = parallelRouter.current();
                        expect(section.value['task1__completion-status']).toEqual('incomplete');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({q1: true}, 'a', 'ANSWER'); // #task2.e
                        expect(section.id).toBe('e');
                        expect(section.value['task1__completion-status']).toEqual('completed');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({q1: false}, 'a', 'ANSWER'); // b.
                        expect(section.id).toBe('b');
                        expect(section.value['task1__completion-status']).toEqual('incomplete');
                    });
                });
            });
        });
        describe('Multi-machine cascade', () => {
            it('should retract answers and cause a multi-machines-wide cascade', () => {
                let parallelRouter = createParallelRouter({
                    currentSectionId: 'a',
                    routes: {
                        id: 'parallel-routes-test',
                        type: 'parallel',
                        states: {
                            task1: {
                                id: 'task1',
                                initial: 'a',
                                currentSectionId: 'a',
                                states: {
                                    a: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'b',
                                                    cond: ['==', '$.answers.a.q1', 'foo']
                                                },
                                                {
                                                    target: 'c',
                                                    cond: ['==', '$.answers.a.q1', 'bar']
                                                }
                                            ]
                                        }
                                    },
                                    b: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'd'
                                                }
                                            ]
                                        }
                                    },
                                    c: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'd'
                                                }
                                            ]
                                        }
                                    },
                                    d: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: '#task2'
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            task2: {
                                id: 'task2',
                                initial: 'e',
                                currentSectionId: 'e',
                                states: {
                                    e: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'f'
                                                }
                                            ]
                                        }
                                    },
                                    f: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'g',
                                                    cond: ['==', '$.answers.b.q1', 1]
                                                },
                                                {
                                                    target: 'h',
                                                    cond: ['==', '$.answers.c.q1', 1]
                                                }
                                            ]
                                        }
                                    },
                                    g: {
                                        on: {
                                            ANSWER: [
                                                {
                                                    target: 'h'
                                                }
                                            ]
                                        }
                                    },
                                    h: {
                                        type: 'final'
                                    }
                                }
                            },
                            'task1__applicability-status': {
                                id: 'task1__applicability-status',
                                initial: 'applicable',
                                currentSectionId: 'applicable',
                                states: {
                                    applicable: {}
                                }
                            },
                            'task2__applicability-status': {
                                id: 'task2__applicability-status',
                                initial: 'notApplicable',
                                currentSectionId: 'notApplicable',
                                states: {
                                    notApplicable: {
                                        on: {
                                            UPDATE__STATUS: [
                                                {
                                                    target: 'applicable',
                                                    cond: ['|role.all', 'role1']
                                                },
                                                {
                                                    target: 'notApplicable'
                                                }
                                            ]
                                        }
                                    },
                                    applicable: {
                                        on: {
                                            CASCADE__TASK1: [
                                                {
                                                    target: 'notApplicable'
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    attributes: {
                        q__roles: {
                            role1: {
                                schema: {
                                    $schema: 'http://json-schema.org/draft-07/schema#',
                                    title: 'Role 1',
                                    type: 'boolean',
                                    const: ['==', '$.answers.a.q1', 'foo'],
                                    examples: [{}],
                                    invalidExamples: [{}]
                                }
                            }
                        }
                    },
                    answers: {}
                });

                let section = parallelRouter.current();
                expect(section.value['task2__applicability-status']).toEqual('notApplicable');
                expect(section.context.routes.states.task1.progress).toEqual(['a']);

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 'foo'}, 'a', 'ANSWER'); // b.
                expect(section.value['task2__applicability-status']).toEqual('applicable');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 1}, 'b', 'ANSWER'); // d.
                expect(section.context.routes.states.task1.progress).toEqual(['a', 'b', 'd']);

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'd', 'ANSWER'); // #task2.e
                expect(section.context.routes.states.task2.progress).toEqual(['e']);

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'e', 'ANSWER'); // f.
                expect(section.id).toEqual('f');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'f', 'ANSWER'); // g. has routing dependency on b
                expect(section.id).toEqual('g');

                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({}, 'g', 'ANSWER'); // h.
                expect(section.id).toEqual('h');

                // re-answer the first question in task1. this answer makes role1 irrelevant.
                parallelRouter = createParallelRouter(section.context);
                section = parallelRouter.next({q1: 'bar'}, 'a', 'ANSWER');
                expect(section.id).toEqual('c');
                expect(section.context.routes.states.task1.progress).toEqual(['a', 'c']);
                expect(section.context.routes.states.task2.progress).toEqual(['e', 'f']);
                expect(section.value['task2__applicability-status']).toEqual('notApplicable');
            });
            describe('First question relies on itself', () => {
                describe('role routing rule', () => {
                    it('should cause the second task to become "incomplete"', () => {
                        let parallelRouter = createParallelRouter({
                            currentSectionId: 'p-applicant-who-are-you-applying-for',
                            routes: {
                                id: 'parallel-routes-test',
                                type: 'parallel',
                                states: {
                                    't-about-application': {
                                        id: 't-about-application',
                                        initial: 'p-applicant-who-are-you-applying-for',
                                        currentSectionId: 'p-applicant-who-are-you-applying-for',
                                        progress: ['p-applicant-who-are-you-applying-for'],
                                        states: {
                                            'p-applicant-who-are-you-applying-for': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: 'p-applicant-are-you-18-or-over'
                                                        }
                                                        // {
                                                        //     target:
                                                        //         'p-applicant-are-you-18-or-over',
                                                        //     cond: ['|role.all', 'proxy']
                                                        // },
                                                        // {
                                                        //     target:
                                                        //         'p-applicant-are-you-18-or-over',
                                                        //     cond: ['|role.all', 'myself']
                                                        // }
                                                    ]
                                                }
                                            },
                                            'p-applicant-are-you-18-or-over': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target:
                                                                'p--was-the-crime-reported-to-police',
                                                            cond: [
                                                                'or',
                                                                ['|role.all', 'proxy'],
                                                                ['|role.all', 'adult', 'capable']
                                                            ]
                                                        },
                                                        {
                                                            target: 'p-applicant-under-18'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p--was-the-crime-reported-to-police': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target:
                                                                'p-applicant-you-cannot-get-compensation',
                                                            cond: [
                                                                '==',
                                                                '$.answers.p--was-the-crime-reported-to-police.q--was-the-crime-reported-to-police',
                                                                false
                                                            ]
                                                        },
                                                        {
                                                            target: 'p--context-crime-ref-no',
                                                            cond: [
                                                                '==',
                                                                '$.answers.p--was-the-crime-reported-to-police.q--was-the-crime-reported-to-police',
                                                                true
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-under-18': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target:
                                                                'p--transition-someone-18-or-over-to-apply',
                                                            cond: [
                                                                '==',
                                                                '$.answers.p-applicant-under-18.q-applicant-under-18',
                                                                false
                                                            ]
                                                        },
                                                        {
                                                            target:
                                                                'p-applicant-what-do-you-want-to-do'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-you-cannot-get-compensation': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: 'p-applicant-fatal-claim'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p--context-crime-ref-no': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: 'p-applicant-fatal-claim'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p--transition-someone-18-or-over-to-apply': {
                                                type: 'final'
                                            },
                                            'p-applicant-what-do-you-want-to-do': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: 'p--transition-apply-when-18',
                                                            cond: [
                                                                '==',
                                                                '$.answers.p-applicant-what-do-you-want-to-do.q-applicant-what-do-you-want-to-do',
                                                                'close'
                                                            ]
                                                        },
                                                        {
                                                            target:
                                                                'p--transition-request-a-call-back',
                                                            cond: [
                                                                '==',
                                                                '$.answers.p-applicant-what-do-you-want-to-do.q-applicant-what-do-you-want-to-do',
                                                                'call-back'
                                                            ]
                                                        },
                                                        {
                                                            target: 'p--transition-contact-us',
                                                            cond: [
                                                                '==',
                                                                '$.answers.p-applicant-what-do-you-want-to-do.q-applicant-what-do-you-want-to-do',
                                                                'call-us'
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            'p--transition-apply-when-18': {
                                                type: 'final'
                                            },
                                            'p--transition-request-a-call-back': {
                                                type: 'final'
                                            },
                                            'p--transition-contact-us': {
                                                type: 'final'
                                            },
                                            'p-applicant-fatal-claim': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: 'p-applicant-claim-type',
                                                            cond: ['|role.all', 'deceased']
                                                        },
                                                        {
                                                            target:
                                                                'p-applicant-applied-before-for-this-crime'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-claim-type': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: '#task-list'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-someone-else-applied-before-for-this-crime': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target:
                                                                'p--context-you-should-not-apply-again',
                                                            cond: [
                                                                '==',
                                                                '$.answers.p-applicant-someone-else-applied-before-for-this-crime.q-applicant-someone-else-applied-before-for-this-crime',
                                                                'yes'
                                                            ]
                                                        },
                                                        {
                                                            target: '#task-list'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-applied-before-for-this-crime': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target:
                                                                'p--context-you-should-not-apply-again',
                                                            cond: [
                                                                '==',
                                                                '$.answers.p-applicant-applied-before-for-this-crime.q-applicant-applied-before-for-this-crime',
                                                                true
                                                            ]
                                                        },
                                                        {
                                                            target:
                                                                'p-applicant-someone-else-applied-before-for-this-crime',
                                                            cond: [
                                                                'and',
                                                                [
                                                                    '==',
                                                                    '$.answers.p-applicant-applied-before-for-this-crime.q-applicant-applied-before-for-this-crime',
                                                                    false
                                                                ],
                                                                ['|role.all', 'myself']
                                                            ]
                                                        },
                                                        {
                                                            target:
                                                                'p-proxy-someone-else-applied-before-for-this-crime',
                                                            cond: [
                                                                'and',
                                                                [
                                                                    '==',
                                                                    '$.answers.p-applicant-applied-before-for-this-crime.q-applicant-applied-before-for-this-crime',
                                                                    false
                                                                ],
                                                                ['|role.all', 'proxy']
                                                            ]
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-proxy-someone-else-applied-before-for-this-crime': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target:
                                                                'p--context-you-should-not-apply-again',
                                                            cond: [
                                                                '==',
                                                                '$.answers.p-proxy-someone-else-applied-before-for-this-crime.q-proxy-someone-else-applied-before-for-this-crime',
                                                                true
                                                            ]
                                                        },
                                                        {
                                                            target: '#task-list'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p--context-you-should-not-apply-again': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: '#task-list'
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    't_applicant_personal-details': {
                                        id: 't_applicant_personal-details',
                                        referrer: '#task-list',
                                        initial: 'p--context-applicant-details',
                                        currentSectionId: 'p--context-applicant-details',
                                        progress: ['p--context-applicant-details'],
                                        states: {
                                            'p--context-applicant-details': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: 'p-applicant-enter-your-name',
                                                            cond: ['|role.all', 'proxy']
                                                        },
                                                        {
                                                            target:
                                                                'p-applicant-confirmation-method'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-enter-your-name': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target:
                                                                'p-applicant-have-you-been-known-by-any-other-names'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-confirmation-method': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: 'p-applicant-enter-your-name'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-have-you-been-known-by-any-other-names': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target:
                                                                'p-applicant-enter-your-date-of-birth'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-enter-your-date-of-birth': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target:
                                                                'p-applicant-can-handle-affairs',
                                                            cond: [
                                                                'and',
                                                                [
                                                                    'dateCompare',
                                                                    '$.answers.p-applicant-enter-your-date-of-birth.q-applicant-enter-your-date-of-birth',
                                                                    '>=',
                                                                    '-18',
                                                                    'years'
                                                                ],
                                                                ['|role.all', 'proxy']
                                                            ]
                                                        },
                                                        {
                                                            target: 'p-applicant-enter-your-address'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-can-handle-affairs': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: 'p-applicant-enter-your-address'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-enter-your-address': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target:
                                                                'p-applicant-enter-your-telephone-number',
                                                            cond: [
                                                                'or',
                                                                [
                                                                    '==',
                                                                    '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                                                                    'email'
                                                                ],
                                                                [
                                                                    'and',
                                                                    [
                                                                        'dateCompare',
                                                                        '$.answers.p-applicant-enter-your-date-of-birth.q-applicant-enter-your-date-of-birth',
                                                                        '>=',
                                                                        '-18',
                                                                        'years'
                                                                    ],
                                                                    [
                                                                        '==',
                                                                        '$.answers.p-applicant-can-handle-affairs.q-applicant-capable',
                                                                        true
                                                                    ]
                                                                ]
                                                            ]
                                                        },
                                                        {
                                                            target:
                                                                'p-applicant-enter-your-email-address',
                                                            cond: [
                                                                '==',
                                                                '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                                                                'text'
                                                            ]
                                                        },
                                                        {
                                                            target: '#task-list'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-enter-your-telephone-number': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: '#task-list'
                                                        }
                                                    ]
                                                }
                                            },
                                            'p-applicant-enter-your-email-address': {
                                                on: {
                                                    ANSWER: [
                                                        {
                                                            target: '#task-list'
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    't-about-application__completion-status': {
                                        id: 't-about-application__completion-status',
                                        initial: 'incomplete',
                                        currentSectionId: 'incomplete',
                                        progress: ['incomplete'],
                                        states: {
                                            incomplete: {
                                                on: {
                                                    'COMPLETE__T-ABOUT-APPLICATION': [
                                                        {
                                                            target: 'completed'
                                                        }
                                                    ]
                                                }
                                            },
                                            completed: {
                                                on: {
                                                    'CASCADE__T-ABOUT-APPLICATION': [
                                                        {
                                                            target: 'incomplete'
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    't-about-application__applicability-status': {
                                        id: 't-about-application__applicability-status',
                                        initial: 'applicable',
                                        currentSectionId: 'applicable',
                                        progress: ['applicable'],
                                        states: {
                                            applicable: {}
                                        }
                                    },
                                    't_applicant_personal-details__completion-status': {
                                        id: 't_applicant_personal-details__completion-status',
                                        initial: 'incomplete',
                                        currentSectionId: 'incomplete',
                                        progress: ['incomplete'],
                                        states: {
                                            incomplete: {
                                                on: {
                                                    'COMPLETE__T_APPLICANT_PERSONAL-DETAILS': [
                                                        {
                                                            target: 'completed'
                                                        }
                                                    ]
                                                }
                                            },
                                            completed: {
                                                on: {
                                                    'CASCADE__T_APPLICANT_PERSONAL-DETAILS': [
                                                        {
                                                            target: 'incomplete'
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    't_applicant_personal-details__applicability-status': {
                                        id: 't_applicant_personal-details__applicability-status',
                                        initial: 'applicable',
                                        currentSectionId: 'applicable',
                                        progress: ['applicable'],
                                        states: {
                                            applicable: {}
                                        }
                                    },
                                    'task-list': {
                                        id: 'task-list',
                                        initial: 'p-task-list',
                                        currentSectionId: 'p-task-list',
                                        progress: ['p-task-list'],
                                        states: {
                                            'p-task-list': {
                                                type: 'final'
                                            }
                                        }
                                    }
                                }
                            },
                            attributes: {
                                q__roles: {
                                    proxy: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title:
                                                'A type of proxy for the applicant e.g. mainapplicant, rep',
                                            type: 'boolean',
                                            const: [
                                                '==',
                                                '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                                                'someone-else'
                                            ]
                                        }
                                    },
                                    myself: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'Myself journey role',
                                            type: 'boolean',
                                            const: [
                                                '==',
                                                '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                                                'myself'
                                            ]
                                        }
                                    },
                                    child: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'Child applicant role',
                                            type: 'boolean',
                                            const: [
                                                '==',
                                                '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                                                false
                                            ]
                                        }
                                    },
                                    adult: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'Adult applicant role',
                                            type: 'boolean',
                                            const: [
                                                '==',
                                                '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                                                true
                                            ]
                                        }
                                    },
                                    mainapplicant: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'Main Applicant role',
                                            type: 'boolean',
                                            const: [
                                                'or',
                                                [
                                                    '==',
                                                    '$.answers.p-mainapplicant-parent.q-mainapplicant-parent',
                                                    true
                                                ],
                                                [
                                                    '==',
                                                    '$.answers.p--has-legal-authority.q--has-legal-authority',
                                                    true
                                                ]
                                            ]
                                        }
                                    },
                                    rep: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'Rep role',
                                            type: 'boolean',
                                            const: [
                                                'or',
                                                [
                                                    'and',
                                                    [
                                                        '==',
                                                        '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                                                        'someone-else'
                                                    ],
                                                    [
                                                        '==',
                                                        '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                                                        false
                                                    ],
                                                    [
                                                        '==',
                                                        '$.answers.p-mainapplicant-parent.q-mainapplicant-parent',
                                                        false
                                                    ],
                                                    [
                                                        '==',
                                                        '$.answers.p--has-legal-authority.q--has-legal-authority',
                                                        false
                                                    ]
                                                ],
                                                [
                                                    'and',
                                                    [
                                                        '==',
                                                        '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                                                        'someone-else'
                                                    ],
                                                    [
                                                        '==',
                                                        '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                                                        true
                                                    ],
                                                    [
                                                        '==',
                                                        '$.answers.p--has-legal-authority.q--has-legal-authority',
                                                        false
                                                    ],
                                                    [
                                                        '==',
                                                        '$.answers.p--represents-legal-authority.q--represents-legal-authority',
                                                        true
                                                    ]
                                                ],
                                                [
                                                    'and',
                                                    [
                                                        '==',
                                                        '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                                                        'someone-else'
                                                    ],
                                                    [
                                                        '==',
                                                        '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                                                        true
                                                    ],
                                                    [
                                                        '==',
                                                        '$.answers.p--has-legal-authority.q--has-legal-authority',
                                                        false
                                                    ],
                                                    [
                                                        '==',
                                                        '$.answers.p--represents-legal-authority.q--represents-legal-authority',
                                                        false
                                                    ]
                                                ],
                                                [
                                                    'and',
                                                    [
                                                        '==',
                                                        '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                                                        'someone-else'
                                                    ],
                                                    [
                                                        '==',
                                                        '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                                                        true
                                                    ],
                                                    [
                                                        '==',
                                                        '$.answers.p-applicant-can-handle-affairs.q-applicant-capable',
                                                        true
                                                    ]
                                                ]
                                            ]
                                        }
                                    },
                                    noauthority: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'no authority role',
                                            type: 'boolean',
                                            const: [
                                                'and',
                                                [
                                                    '==',
                                                    '$.answers.p-applicant-are-you-18-or-over.q-applicant-are-you-18-or-over',
                                                    true
                                                ],
                                                [
                                                    '==',
                                                    '$.answers.p-applicant-can-handle-affairs.q-applicant-capable',
                                                    false
                                                ],
                                                [
                                                    '==',
                                                    '$.answers.p--has-legal-authority.q--has-legal-authority',
                                                    false
                                                ],
                                                [
                                                    '==',
                                                    '$.answers.p--represents-legal-authority.q--represents-legal-authority',
                                                    false
                                                ]
                                            ]
                                        }
                                    },
                                    incapable: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'incapable role',
                                            type: 'boolean',
                                            const: [
                                                '==',
                                                '$.answers.p-applicant-can-handle-affairs.q-applicant-capable',
                                                false
                                            ]
                                        }
                                    },
                                    capable: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'capable role',
                                            type: 'boolean',
                                            const: [
                                                'or',
                                                [
                                                    '==',
                                                    '$.answers.p-applicant-can-handle-affairs.q-applicant-capable',
                                                    true
                                                ],
                                                [
                                                    '==',
                                                    '$.answers.p-applicant-who-are-you-applying-for.q-applicant-who-are-you-applying-for',
                                                    'myself'
                                                ]
                                            ]
                                        }
                                    },
                                    authority: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'Legal authority role',
                                            type: 'boolean',
                                            const: [
                                                'or',
                                                [
                                                    '==',
                                                    '$.answers.p--has-legal-authority.q--has-legal-authority',
                                                    true
                                                ],
                                                [
                                                    '==',
                                                    '$.answers.p--represents-legal-authority.q--represents-legal-authority',
                                                    true
                                                ]
                                            ]
                                        }
                                    },
                                    deceased: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'Deceased role',
                                            type: 'boolean',
                                            const: [
                                                '==',
                                                '$.answers.p-applicant-fatal-claim.q-applicant-fatal-claim',
                                                true
                                            ]
                                        }
                                    },
                                    nonDeceased: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'Non Deceased journey role',
                                            type: 'boolean',
                                            const: [
                                                '==',
                                                '$.answers.p-applicant-fatal-claim.q-applicant-fatal-claim',
                                                false
                                            ]
                                        }
                                    },
                                    childUnder12: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'child under the age of 12',
                                            type: 'boolean',
                                            const: [
                                                'dateCompare',
                                                '$.answers.p-applicant-enter-your-date-of-birth.q-applicant-enter-your-date-of-birth',
                                                '<',
                                                '-12',
                                                'years'
                                            ]
                                        }
                                    },
                                    childOver12: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'child over the age of 12',
                                            type: 'boolean',
                                            const: [
                                                'dateCompare',
                                                '$.answers.p-applicant-enter-your-date-of-birth.q-applicant-enter-your-date-of-birth',
                                                '>=',
                                                '-12',
                                                'years'
                                            ]
                                        }
                                    },
                                    noContactMethod: {
                                        schema: {
                                            $schema: 'http://json-schema.org/draft-07/schema#',
                                            title: 'has no email or text contact method',
                                            type: 'boolean',
                                            const: [
                                                'or',
                                                [
                                                    '==',
                                                    '$.answers.p-applicant-confirmation-method.q-applicant-confirmation-method',
                                                    'none'
                                                ],
                                                [
                                                    '==',
                                                    '$.answers.p-mainapplicant-confirmation-method.q-mainapplicant-confirmation-method',
                                                    'none'
                                                ],
                                                [
                                                    '==',
                                                    '$.answers.p-rep-confirmation-method.q-rep-confirmation-method',
                                                    'none'
                                                ]
                                            ]
                                        }
                                    }
                                }
                            },
                            answers: {}
                        });

                        /* eslint-disable prettier/prettier */
                        let section = parallelRouter.current();
                        expect(section.value['t-about-application__completion-status']).toEqual('incomplete');
                        expect(section.value['t_applicant_personal-details__completion-status']).toEqual('incomplete');
                        expect(section.context.routes.states['t-about-application'].progress).toEqual(['p-applicant-who-are-you-applying-for']);

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q-applicant-who-are-you-applying-for': 'myself'}, 'p-applicant-who-are-you-applying-for', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q-applicant-are-you-18-or-over': true}, 'p-applicant-are-you-18-or-over', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q--was-the-crime-reported-to-police': false}, 'p--was-the-crime-reported-to-police', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({}, 'p-applicant-you-cannot-get-compensation', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q-applicant-fatal-claim': false}, 'p-applicant-fatal-claim', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q-applicant-applied-before-for-this-crime': false}, 'p-applicant-applied-before-for-this-crime', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q-applicant-someone-else-applied-before-for-this-crime': false}, 'p-applicant-someone-else-applied-before-for-this-crime', 'ANSWER');
                        expect(section.value['t-about-application__completion-status']).toEqual('completed');
                        expect(section.value['t_applicant_personal-details__completion-status']).toEqual('incomplete');
                        expect(section.context.currentSectionId).toEqual('p-task-list');

                        // enter the second task.
                        section = parallelRouter.current('p--context-applicant-details');
                        expect(section.value['t-about-application__completion-status']).toEqual('completed');
                        expect(section.value['t_applicant_personal-details__completion-status']).toEqual('incomplete');
                        expect(section.context.routes.states['t_applicant_personal-details'].progress).toEqual(['p--context-applicant-details']);


                        section = parallelRouter.next({}, 'p--context-applicant-details', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({
                            'q-applicant-confirmation-method': 'email',
                            'q-applicant-enter-your-email-address': 'foo@bar.com'
                        }, 'p-applicant-confirmation-method', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({
                            'q-applicant-title': 'Mr',
                            'q-applicant-first-name': 'Foo',
                            'q-applicant-last-name': 'Bar'
                        }, 'p-applicant-enter-your-name', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({
                            'q-applicant-have-you-been-known-by-any-other-names': false
                        }, 'p-applicant-have-you-been-known-by-any-other-names', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({
                            'q-applicant-enter-your-date-of-birth': '1970-01-01T00:00:00.000Z'
                        }, 'p-applicant-enter-your-date-of-birth', 'ANSWER');

                        // parallelRouter = createParallelRouter(section.context);
                        // section = parallelRouter.next({
                        //     'q-applicant-can-handle-affairs': false
                        // }, 'p-applicant-can-handle-affairs', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({
                            'q-applicant-building-and-street': '1 Foo Lane',
                            'q-applicant-building-and-street-2': 'Flat 2/3',
                            'q-applicant-building-and-street-3': 'FooLocality',
                            'q-applicant-town-or-city': 'FooCity',
                            'q-applicant-postcode': 'G1 1XX'
                        }, 'p-applicant-enter-your-address', 'ANSWER');


                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({}, 'p-applicant-enter-your-telephone-number', 'ANSWER');
                        expect(section.value['t-about-application__completion-status']).toEqual('completed');
                        expect(section.value['t_applicant_personal-details__completion-status']).toEqual('completed');
                        expect(section.context.currentSectionId).toEqual('p-task-list');

                        // go back to first task
                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.current('p-applicant-who-are-you-applying-for');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q-applicant-who-are-you-applying-for': 'someone-else'}, 'p-applicant-who-are-you-applying-for', 'ANSWER');
                        expect(section.value['t-about-application__completion-status']).toEqual('incomplete');
                        expect(section.value['t_applicant_personal-details__completion-status']).toEqual('incomplete');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q-applicant-are-you-18-or-over': true}, 'p-applicant-are-you-18-or-over', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q--was-the-crime-reported-to-police': false}, 'p--was-the-crime-reported-to-police', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({}, 'p-applicant-you-cannot-get-compensation', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q-applicant-fatal-claim': false}, 'p-applicant-fatal-claim', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q-applicant-applied-before-for-this-crime': false}, 'p-applicant-applied-before-for-this-crime', 'ANSWER');

                        parallelRouter = createParallelRouter(section.context);
                        section = parallelRouter.next({'q-proxy-someone-else-applied-before-for-this-crime': false}, 'p-proxy-someone-else-applied-before-for-this-crime', 'ANSWER');

                        expect(section.value['t-about-application__completion-status']).toEqual('completed');
                        expect(section.value['t_applicant_personal-details__completion-status']).toEqual('incomplete');
                        expect(section.context.currentSectionId).toEqual('p-task-list');
                        /* eslint-enable prettier/prettier */
                    });
                });
            });
        });
    });
});
