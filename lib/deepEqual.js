'use strict';

const {keys} = Object;
const {isArray} = Array;

module.exports = function eq(a, b) {
    if (typeof a === 'string' || typeof a === 'number' || a === true || a === false || a === null) {
        return a === b;
    }

    if (isArray(a)) {
        if (!isArray(b)) {
            return false;
        }

        let i = a.length;

        if (i !== b.length) {
            return false;
        }

        // recurse
        // eslint-disable-next-line
        while (i--) {
            if (!eq(a[i], b[i])) {
                return false;
            }
        }

        return true;
    }

    if (isArray(b)) {
        return false;
    }

    // Must be an object
    const aKeys = keys(a);
    const bKeys = keys(b);
    let i = aKeys.length;
    let j = i;

    if (i !== bKeys.length) {
        return false;
    }

    // Have they got all the same keys
    // eslint-disable-next-line
    while (i--) {
        if (!bKeys.includes(aKeys[i])) {
            return false;
        }
    }

    // All the keys eq, lets check they're values
    // eslint-disable-next-line
    while (j--) {
        const key = aKeys[j];

        if (!eq(a[key], b[key])) {
            return false;
        }
    }

    return true;
};
