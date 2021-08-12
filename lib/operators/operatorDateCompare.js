'use strict';

const moment = require('moment');

function getAnswer(questionDotPointer, answers) {
    let value = false;
    if (!questionDotPointer) {
        return value;
    }
    const questionId = questionDotPointer.split('.')[3];
    Object.keys(answers).forEach(page => {
        if (questionId in answers[page]) {
            value = answers[page][questionId];
        }
    });
    return value;
}

function dateCompare(rule, data) {
    const inputDate = getAnswer(rule[1], data.answers); // LHS.
    // direction of comparison. e.g. '>' means: is `inputDate` more than `amount` of `units`  different from `compareDate`.
    // i.e. is '2005-02-01T00:00:00.000Z' more than -12 years different from (i.e. 12 years before) '2021-02-01T00:00:00.000Z' - this evaluates to `true`.
    const comparator = ['>', '<', '==', '<=', '>='].includes(rule[2]) ? rule[2] : '>'; // can be '>', '<', '==', '<=', or '>='. defaults to '>'.
    const amount = parseInt(rule[3], 10); // number of `units` of time that we want to compare the days by e.g. '12', '-3'.
    const units = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'].includes(
        rule[4]
    )
        ? rule[4]
        : 'years'; // can be seconds, minutes, hours, days, weeks, months, or years. defaults to 'years'.
    // date that you are comparing the `inputDate` against. when
    // `undefined` is passed in to moment(), it defaults to today's date.
    // if nothing is defined here, `undefined` is used.
    const compareDate = getAnswer(rule[5], data.answers) || undefined;

    // get difference, in terms of `units` (truncated, not rounded).
    const diff = moment(inputDate).diff(moment(compareDate), units);

    // a negative number signifies a difference of "days before".
    //     e.g. a `diff` of `-1` means the "LHS" date is 1 day before
    // the "RHS" date.
    // a positive number signifies a difference of "days after".
    //     e.g. a `diff` of `2` means the "LHS" date is 2 days after
    // the "RHS" date.
    // We want this diff to be the same sign (+/-) as the
    // supplied `amount` (`rule[3]`). If they are not the same sign as
    // each other, then that means that we are comparing difference that are
    // either side of "today". A `diff` of `-2` is not the same as an `amount
    // of `2`, they are comparing past, and future differences.
    //
    // The absolute value is the same, but the relative difference is not.
    // e.g. yesterday and tomorrow have an "absolute" difference of 1 days from
    // today, but the are completely different relative to today.
    //
    // if the `amount and `diff` are both negative, or both positive, or both `0`,
    // then the bitwise operation returns 0 and ignores this block. If the numbers
    // have different signs then this operation returns `-1`, so it returns false.
    // In the case of both `amount` and `diff` being `0`, it doesn't matter what
    // sign either of then are, the bitwise will return `0` and ignore this block.
    // This is the desired behavior because `0` is a valid amount to query.
    // eslint-disable-next-line no-bitwise
    if ((amount * diff) >> 31 !== 0) {
        return false;
    }

    // we need to compare the absolute number here to account for the negative number line.
    const absDiff = Math.ceil(Math.abs(diff));
    const absAmount = Math.abs(amount);

    if (comparator === '==') {
        return absDiff === absAmount;
    }
    if (comparator === '>') {
        return absDiff > absAmount;
    }
    if (comparator === '<') {
        return absDiff < absAmount;
    }
    if (comparator === '<=') {
        return absDiff <= absAmount;
    }
    if (comparator === '>=') {
        return absDiff >= absAmount;
    }

    return false;
}

module.exports = dateCompare;
