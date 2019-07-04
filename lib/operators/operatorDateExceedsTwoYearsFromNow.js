'use strict';

const moment = require('moment');

function dateExceedsTwoYearsFromNow(date) {
    const now = moment();
    const dateToCheck = moment(date); // value of the answer
    const diff = now.diff(dateToCheck, 'years', true);

    return diff > 2;
}

module.exports = dateExceedsTwoYearsFromNow;
