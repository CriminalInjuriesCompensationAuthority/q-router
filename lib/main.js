'use strict';

const qExpressionsParallelAlpha = require('q-expressions-parallel-alpha');
const qRouter = require('./index');
const parallelRouter = require('./parallel');

function router(spec) {
    if (spec.routes.type === 'parallel') {
        if (spec.version === '12.4.0') {
            return parallelRouter(spec, qExpressionsParallelAlpha);
        }
        return parallelRouter(spec);
    }
    return qRouter(spec);
}

module.exports = router;
