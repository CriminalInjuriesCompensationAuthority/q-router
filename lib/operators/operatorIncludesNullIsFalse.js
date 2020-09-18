'use strict';

function includesNullIsFalse(rule, data) {
    const {answers} = data;
    const question = rule[1].split('.')[3];
    let hasValue = false;
    Object.keys(answers).forEach(page => {
        if (question in answers[page]) {
            hasValue = answers[page][question].includes(rule[2]);
        }
    });

    return hasValue;
}

module.exports = includesNullIsFalse;
