const moment = require('moment');

function dateDifferenceGreaterThanTwoDays(date1, date2) {
    const firstDate = moment(date1);
    const secondDate = moment(date2); // value of the answer
    const diff = Math.abs(firstDate.diff(secondDate, 'days')); // Calculate date diff, correcting for a<b returning negative number

    return diff > 2;
}

module.exports = dateDifferenceGreaterThanTwoDays;
