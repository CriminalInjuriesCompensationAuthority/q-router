module.exports = {
    'q1 = baz': function a(answers, event, currentQuestion, a, b, c, d) {
        // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
        // console.log( answers, event, currentQuestion, a, b ,c ,d);
        // console.log('/@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');

        return !answers.q1.inactive && answers.q1.value === 'baz';
    },
    'q1 = foo q3 = bar': function b(answers) {
        return (
            !answers.q1.inactive &&
            answers.q1.value === 'foo' &&
            (!answers.q3.inactive && answers.q3.value === 'bar')
        );
    },
    'q1 = bar q3 = foo': function c(answers) {
        return (
            !answers.q1.inactive &&
            answers.q1.value === 'bar' &&
            (!answers.q3.inactive && answers.q3.value === 'foo')
        );
    },
    '4 times only': function d(answers) {
        answers.count += 1;
        console.log('count: ', answers.count);

        if (answers.count < 4) {
            return true;
        }

        return false;
    }
};
