'use strict';

const moment = require('moment');

function dateDifferenceGreaterThanTwoDays(rule, data) {
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

    function lessThanTwoDays(date1, date2) {
        if (date1 && date2) {
            const firstDate = moment(date1);
            const secondDate = moment(date2);
            const diff = Math.abs(firstDate.diff(secondDate, 'days')); // Calculate date diff, correcting for a<b returning negative number
            return diff > 2;
        }
        return false;
    }

    const {answers} = data;
    const date1 = findAnswers(answers, rule[1]);
    const date2 = findAnswers(answers, rule[2]);

    return lessThanTwoDays(date1, date2);
}

module.exports = dateDifferenceGreaterThanTwoDays;
