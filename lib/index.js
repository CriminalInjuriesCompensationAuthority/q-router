const { Machine } = require('xstate');

function qRouter(spec) {
    const { routes } = spec;
    const machine = Machine(routes);
    let currentState = machine.initialState;

    function getCurrentState() {
        return currentState;
    }

    function next(event) {
        currentState = machine.transition(currentState, event /* , extendedState */);
    }

    return Object.freeze({
        getCurrentState,
        next
    });
}

module.exports = qRouter;
