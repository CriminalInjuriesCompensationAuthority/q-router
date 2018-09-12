// [">", ["+", 1, 2], 2]

const is = require('@sindresorhus/is');
let _data;

function replaceValueRefWithValue(ref, data) {

    const v = ref.split('.').reduce((o, i) => {        
        return o[i];
    }, data);

    return v;
}

const operators = {
    '+': values => values.reduce((a, b) => value(a) + value(b)),
    '-': values => values.reduce((a, b) => value(a) - value(b)),
    gt: values =>
        values.every((v, index, arr) => (index !== arr.length - 1 ? v > arr[index + 1] : true)),
    '>': function(values) {
        for (let i = 0; i < values.length - 1; i++) {
            if (values[i] < values[i + 1]) {
                return false;
            }
        }

        return true;
    },
    '<': function(values) {
        for (let i = 0; i < values.length - 1; i++) {
            if (values[i] > values[i + 1]) {
                return false;
            }
        }

        return true;
    },
    '==': function(values) {
        for (let i = 0, v, vv; i < values.length - 1; i++) {
            v = value(values[i]);
            vv = value(values[i + 1]);

            if (v !== vv) {
                return false;
            }
        }

        return true;
    }
};

function value(v) {
    if (Array.isArray(v)) {
        return parse(v);
    }

    // does the value contain a data reference
    if (is.string(v) && v.startsWith('$')) {
        // get reference part
        const ref = v.slice(1);

        return replaceValueRefWithValue(ref, _data);
    }

    return v;
}

function parse(exp, data) {
    if (!Array.isArray(exp)) {
        throw `Expression (${exp}) must be an Array`;
    }

    // TODO: this is horrible... pass the data around, not a global!
    _data = data;

    // copy expression to avoid side affects
    const expCopy = [...exp];

    // if the Array is empty treat it as a standard array
    if (expCopy.length === 0) {
        return expCopy;
    }

    // operator is always the first element of the array
    const operator = operators[expCopy[0]];

    // if the array has no operator treat it as a standard array
    if (!operator) {
        return expCopy;
    }

    // remove the operator from the expression array
    expCopy.shift();

    return operator(expCopy);
}

// console.log(parse(["-", 2, 2]));

// console.log(parse([
//     "-",
//     ["+",
//         1,
//         ["+", 2, 2]
//     ],
//     ["+",
//         2,
//         2
//     ]
// ]));

// console.log(parse(["minus", 5 ,["minus", 6, 5]]));

// console.log(parse(["+", 1, ["+", 3, 3]]));

// console.log(parse( [ "-", ["+", 4, 2], ["+", 3, 1] ] ));

// console.log(parse([">", 2, 1, 0, 5]));
// console.log(parse(["<", 1, 2, 3, 8, 7]));

// console.log(parse(['gt', 3, 2, 1]));
// console.log(parse(['gt', 3, 2, 3]));

// console.log(parse(["==", 2, 2]));

module.exports = parse;
