// [">", ["+", 1, 2], 2]

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
        for (let i = 0; i < values.length - 1; i++) {
            if (values[i] !== values[i + 1]) {
                return false;
            }
        }

        return true;
    }
};

function value(v) {
    return Array.isArray(v) ? parse(v) : v;
}

function parse(exp) {
    if (!Array.isArray(exp)) {
        throw `Expression (${exp}) must be an Array`;
    }

    // copy expressionto avoid side affects
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
