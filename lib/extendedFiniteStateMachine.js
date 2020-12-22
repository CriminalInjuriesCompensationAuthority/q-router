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
        const noConditionDefaultsToTrue = !('cond' in transitionObj);

        return noConditionDefaultsToTrue || evaluateCondition(transitionObj.cond, extendedState);
    }

    function getState(transitionDefinition, extendedState, currentState, stateNode) {
        /*
            transitionDefinition can be defined as a string, object, or array

            {
                on: {
                    // string
                    ANSWER: 'some-target'
                }
            }

            {
                on: {
                    // object
                    ANSWER: {
                        target: 'some-target'
                    }
                }
            }

            {
                on: {
                    // array
                    ANSWER: [
                        {
                            target: 'some-target'
                            cond: [some condition]
                        },
                        {
                            target: 'some-other-target'
                        }
                    ]
                }
            }
        */

        // defaults to no state transition, would return current state
        const stateDefinition = {
            value: currentState.value,
            context: extendedState,
            changed: false,
            meta: {
                previousState: {
                    stateNode,
                    evaluatedTransition: {
                        value: transitionDefinition
                    }
                }
            }
        };

        if (typeof transitionDefinition === 'string') {
            const target = transitionDefinition;

            stateDefinition.value = target;
            stateDefinition.changed = true;
            stateDefinition.meta.previousState.evaluatedTransition.type = 'string';

            return stateDefinition;
        }

        if (Array.isArray(transitionDefinition)) {
            const successfulTransitionIndex = transitionDefinition.findIndex(
                transitionInstance => evaluateTransition(transitionInstance, extendedState) === true
            );

            if (successfulTransitionIndex !== -1) {
                stateDefinition.value = transitionDefinition[successfulTransitionIndex].target;
                stateDefinition.changed = true;
                stateDefinition.meta.previousState.evaluatedTransition.successfulIndex = successfulTransitionIndex;
            }

            stateDefinition.meta.previousState.evaluatedTransition.type = 'array';

            return stateDefinition;
        }

        if (isObjectLiteral(transitionDefinition)) {
            const isValidTransition = evaluateTransition(transitionDefinition, extendedState);

            if (isValidTransition) {
                stateDefinition.value = transitionDefinition.target;
                stateDefinition.changed = true;
            }

            stateDefinition.meta.previousState.evaluatedTransition.type = 'object';

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

            return getState(transitionDefinition, extendedState, currentState, stateNode);
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
