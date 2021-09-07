'use strict';

const moment = require('moment');

function dateCompareToToday(rule, data) {
    const {answers} = data;
    const comparator = rule[1];
    const date = moment(findAnswers(answers, rule[2]));
    const reference = rule[3];
    const granularity = rule[4];
    const diff = Math.abs(moment().diff(date, granularity, true));

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

    if (comparator === "<") {
        return diff < reference;
    } else if (comparator === ">") {
        return diff > reference;
    } else {
        return Error(`Unknown comparator found: "${comparator}"`);
    }
}

module.exports = dateCompareToToday;
