'use strict';

const qRouter = require('./index');
const parallelRouter = require('./parallel');

function router(spec) {
    if (spec.routes.type === 'parallel') {
        return parallelRouter(spec);
    }
    return qRouter(spec);
}

module.exports = router;
