module.exports = {
    initial: 'q1',
    states: {
        q1: {
            on: {
                ANSWER: [{ target: 'q6', cond: 'q1 = baz' }, { target: 'q2' }]
            }
        },
        q2: {
            on: {
                ANSWER: 'q3'
            }
        },
        q3: {
            on: {
                ANSWER: [
                    { target: 'q4', cond: 'q1 = foo q3 = bar' },
                    { target: 'q5', cond: 'q1 = bar q3 = foo' },
                    { target: 'q6' }
                ]
            }
        },
        q4: {
            on: {
                ANSWER: 'q6'
            }
        },
        q5: {
            on: {
                ANSWER: 'q6'
            }
        },
        q6: {
            repeat: true,
            on: {
                ANSWER: [{ target: 'q6', cond: '4 times only' }, { target: 'q7' }]
            }
        },
        q7: {}
    }
};
