const moment = require('moment');

function dateGreaterThanTwoDays(date) {
    const now = moment();
    const dateToCheck = moment(date); // value of the answer
    const diff = now.diff(dateToCheck, 'days', true);

    return diff > 2;
}

module.exports = dateGreaterThanTwoDays;
