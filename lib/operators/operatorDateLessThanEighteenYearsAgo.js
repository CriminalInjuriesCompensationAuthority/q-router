const moment = require('moment');

function dateLessThanEighteenYearsAgo(date) {
    const now = moment();
    const dateToCheck = moment(date); // value of the answer
    const diff = now.diff(dateToCheck, 'years', true);

    return diff < 18;
}

module.exports = dateLessThanEighteenYearsAgo;
