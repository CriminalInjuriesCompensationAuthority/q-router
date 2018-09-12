// const { Machine, State } = require('xstate');

const parse = require('./exp.js');

function Machine(spec) {
    const {
        states,
        evaluateCondition = (cond, extendedStateObject, eventObject, stateId) => parse(cond, extendedStateObject)
    } = spec;
    const initialState = {value: spec.initial};

    // { section1: {} } { type: 'ANSWER' } section1
    function transition(currentState, event, extendedState) {
        // find the currentState
        const stateId = currentState.value;
        const state = states[stateId];

        // get the target state if available
        if ('on' in state) {
            const target = state.on[event];

            // if we have multiple targets execute the correct one by evaluating their condition
            if (Array.isArray(target)) {
                const targets = target;

                // find a target that has no "cond" attribute (assumed true) or whose condition evaluates to true
                const index = targets.findIndex(
                    element =>
                        !('cond' in element) ||
                        evaluateCondition(element.cond, extendedState, event, currentState.value)
                );

                // TODO: no target found throw error?
                if (index !== -1) {
                    return {value: targets[index].target};
                }
            }

            return {value: target};
        }

        return currentState;
    }

    return Object.freeze({
        initialState,
        transition
    });
}

function qRouter(spec) {
    const {routes} = spec;
    const machine = Machine(
        routes /* , {
        guards: {
            bla: function(a, b, c){
                console.log('@@@@@@@@@@@@@@@@@@@@: ', a, b, c);
                return true;
            }
        }
    } */
    );
    let currentState = machine.initialState;
    const stack = [];
    const extendedState = {};

    function getCurrentState() {
        return currentState;
    }

    function next(event = '', values = {}) {
        // values are key:value pairs
        // convert each value to an object with a value property e.g. {someKey:123} becomes {someKey:{value: 123}}
        // this will provide more flexibility when invalidating values used in route conditions
        const processedValues = Object.keys(values).reduce((acc, key) => {
            acc[key] = {value: values[key]};

            return acc;
        }, {});

        stack.push(currentState.value);
        extendedState[currentState.value] = processedValues;

        currentState = machine.transition(currentState, event, extendedState);
    }

    function previous() {
        currentState = {value: stack.pop()};
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
