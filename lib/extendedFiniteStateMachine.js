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
    const initialState = {
        value: spec.initial,
        context: spec.context
    };

    function isObjectLiteral(obj) {
        return obj && !Array.isArray(obj) && typeof obj === 'object';
    }

    function evaluateTransition(transitionObj, extendedState) {
        // eslint-disable-next-line no-underscore-dangle
        if (transitionObj._skip === true) {
            return false;
        }

        return !('cond' in transitionObj) || evaluateCondition(transitionObj.cond, extendedState);
    }

    function getState(transitionDefinition, extendedState, currentState) {
        if (typeof transitionDefinition === 'string') {
            return {
                value: transitionDefinition,
                context: extendedState,
                meta: {
                    fromTransition: true,
                    transitionDefinition: {
                        type: 'string',
                        value: transitionDefinition
                    }
                }
            };
        }

        if (Array.isArray(transitionDefinition)) {
            let successfulIndex = -1;

            for (let i = 0; i < transitionDefinition.length; i += 1) {
                if (evaluateTransition(transitionDefinition[i], extendedState) === true) {
                    successfulIndex = i;
                    break;
                }
            }

            return {
                value:
                    successfulIndex > -1
                        ? transitionDefinition[successfulIndex].target
                        : currentState.value,
                context: {},
                meta: {
                    fromTransition: successfulIndex > -1 || false,
                    transitionDefinition: {
                        type: 'array',
                        value: transitionDefinition,
                        index: successfulIndex
                    }
                }
            };
        }

        if (isObjectLiteral(transitionDefinition)) {
            const isValidTransition = evaluateTransition(transitionDefinition, extendedState);

            if (isValidTransition) {
                return {
                    value: transitionDefinition.target,
                    context: extendedState,
                    meta: {
                        fromTransition: true,
                        transitionDefinition: {
                            type: 'object',
                            value: transitionDefinition
                        }
                    }
                };
            }

            // If target is invalid return the current state
            return {
                value: currentState.value,
                context: extendedState,
                meta: {
                    fromTransition: false,
                    transitionDefinition: {
                        type: 'object',
                        value: transitionDefinition
                    }
                }
            };
        }

        throw Error(
            `q-router - A transition definition must be either a string or object literal. Instead, recieved: ${transitionDefinition}`
        );
    }

    // { section1: {} } { type: 'ANSWER' } section1
    function transition(currentState, event, extendedState) {
        // find the currentState
        const sectionId = currentState.value;
        const state = states[sectionId];

        // get the target state if available
        if ('on' in state) {
            const transitionDefinition = state.on[event];

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
