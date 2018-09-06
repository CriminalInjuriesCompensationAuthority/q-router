const { Machine, State } = require('xstate');

function qRouter(spec) {
    const { routes } = spec;
    const machine = Machine(routes);
    let currentState = machine.initialState;
    const stack = [];
    const extendedState = {};

    function getCurrentState() {
        return currentState;
    }

    function next(event, value) {
        stack.push(currentState.value);
        extendedState[currentState.value] = { value };

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
        history: stack,
        extendedState
    });
}

module.exports = qRouter;
