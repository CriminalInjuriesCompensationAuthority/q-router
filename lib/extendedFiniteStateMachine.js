'use strict';

const jr = require('json-rules')();
const operatorAnsweredLessThan = require('./operators/operatorAnsweredLessThan');
const operatorDateExceedsTwoYearsFromNow = require('./operators/operatorDateExceedsTwoYearsFromNow');
const operatorDateLessThanEighteenYearsAgo = require('./operators/operatorDateLessThanEighteenYearsAgo');
const operatorDateGreaterThanTwoDays = require('./operators/operatorDateDifferenceGreaterThanTwoDays');

jr.addOperator('answeredLessThan', operatorAnsweredLessThan, true);
jr.addOperator('dateExceedsTwoYearsFromNow', operatorDateExceedsTwoYearsFromNow);
jr.addOperator('dateLessThanEighteenYearsAgo', operatorDateLessThanEighteenYearsAgo);
jr.addOperator('dateDifferenceGreaterThanTwoDays', operatorDateGreaterThanTwoDays, true);

function createMachine(spec) {
    const {
        states,
        evaluateCondition = (cond, extendedStateObject /* , eventObject, sectionId, guard */) =>
            jr.evaluate(cond, extendedStateObject)
    } = spec;

    function isFinalState(stateId) {
        return states[stateId].type === 'final';
    }

    const initialState = {
        value: spec.initial,
        context: spec.context,
        changed: undefined,
        done: isFinalState(spec.initial),
        history: undefined
    };

    function isObjectLiteral(obj) {
        return obj && !Array.isArray(obj) && typeof obj === 'object';
    }

    function evaluateTransition(transitionObj, extendedState) {
        const noConditionDefaultsToTrue = !('cond' in transitionObj);

        return noConditionDefaultsToTrue || evaluateCondition(transitionObj.cond, extendedState);
    }

    function getState(transitionDefinition, extendedState, currentState) {
        // defaults to no state transition, would return current state
        const stateDefinition = {
            value: currentState.value,
            context: extendedState,
            changed: false,
            done: isFinalState(currentState.value),
            history: undefined
        };

        if (typeof transitionDefinition === 'string') {
            const target = transitionDefinition;

            stateDefinition.value = target;
            stateDefinition.changed = true;
            stateDefinition.done = isFinalState(target);
            stateDefinition.history = {value: currentState.value};

            return stateDefinition;
        }

        if (Array.isArray(transitionDefinition)) {
            const successfulGuardIndex = transitionDefinition.findIndex(
                transitionInstance => evaluateTransition(transitionInstance, extendedState) === true
            );

            if (successfulGuardIndex !== -1) {
                const {target} = transitionDefinition[successfulGuardIndex];

                stateDefinition.value = target;
                stateDefinition.changed = true;
                stateDefinition.done = isFinalState(target);
                stateDefinition.history = {value: currentState.value, successfulGuardIndex};
            }

            return stateDefinition;
        }

        if (isObjectLiteral(transitionDefinition)) {
            const isValidTransition = evaluateTransition(transitionDefinition, extendedState);

            if (isValidTransition) {
                const {target} = transitionDefinition;

                stateDefinition.value = target;
                stateDefinition.changed = true;
                stateDefinition.done = isFinalState(target);
                stateDefinition.history = {value: currentState.value};
            }

            return stateDefinition;
        }

        throw Error(
            `q-router - A transition definition must be either a string, object literal, or array. Instead, recieved: ${transitionDefinition}`
        );
    }

    function transition(currentState, event, extendedState) {
        // find the currentState
        const sectionId = currentState.value;
        const stateNode = states[sectionId];

        // get the target state if available
        if ('on' in stateNode) {
            const transitionDefinition = stateNode.on[event];

            if (!transitionDefinition) {
                throw Error(`q-router - Event: "${event}" not found on state: "${sectionId}"`);
            }

            return getState(transitionDefinition, extendedState, currentState);
        }

        // TODO: Handle final states e.g. states with no target states. Currently just returns itself (currentState)
        return currentState;
    }

    return Object.freeze({
        initialState,
        transition
    });
}

module.exports = createMachine;
