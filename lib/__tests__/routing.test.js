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

        expect(router.getCurrentState().value).toEqual('section3');
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

        expect(router.history).toEqual(['section1', 'section2', 'section3']);
    });
});
