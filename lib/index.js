const { Machine, State } = require('xstate');

function qRouter(spec) {
    const { routes } = spec;
    const machine = Machine(routes);
    let currentState = machine.initialState;
    const stack = [];
    const answers = {};

    function getCurrentState() {
        return currentState;
    }

    function next(event) {
        stack.push(currentState.value);

        currentState = machine.transition(currentState, event /* , extendedState */);
    }

    function previous() {
        const previousState = stack.pop();
        currentState = previousState ? State.from(previousState /*, extendedState */) : machine.initialState;
    }

    return Object.freeze({
        getCurrentState,
        next,
        previous,
        history: stack
    });
}

module.exports = qRouter;
