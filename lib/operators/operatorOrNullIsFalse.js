'use strict';

function orNullIsFalse(rule, data) {
    function findAnswers(answers, questionObject) {
        const question = questionObject.split('.')[3];
        let value = false;
        Object.keys(answers).forEach(page => {
            if (question in answers[page]) {
                value = answers[page][question];
            }
        });
        return value;
    }

    const {answers} = data;
    let returnValue = false;
    for (let i=1; i<rule.length; i++){
        let answerFoundAndTrue = findAnswers(answers, rule[i]);
        returnValue = answerFoundAndTrue ? true : returnValue
    }

    return returnValue;
}

module.exports = orNullIsFalse;
