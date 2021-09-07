'use strict';

const jr = require('json-rules')();
const operatorAnsweredLessThan = require('./operators/operatorAnsweredLessThan');
const operatorDateExceedsTwoYearsFromNow = require('./operators/operatorDateExceedsTwoYearsFromNow');
const operatorDateLessThanEighteenYearsAgo = require('./operators/operatorDateLessThanEighteenYearsAgo');
const operatorDateGreaterThanTwoDays = require('./operators/operatorDateDifferenceGreaterThanTwoDays');
const operatorDateCompareToToday = require('./operators/operatorDateCompareToToday');

jr.addOperator('answeredLessThan', operatorAnsweredLessThan, true);
jr.addOperator('dateExceedsTwoYearsFromNow', operatorDateExceedsTwoYearsFromNow);
jr.addOperator('dateLessThanEighteenYearsAgo', operatorDateLessThanEighteenYearsAgo);
jr.addOperator('dateDifferenceGreaterThanTwoDays', operatorDateGreaterThanTwoDays, true);
jr.addOperator('operatorDateCompareToToday', operatorDateCompareToToday, true);

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

    // { section1: {} } { type: 'ANSWER' } section1
    function transition(currentState, event, extendedState) {
        // find the currentState
        const sectionId = currentState.value;
        const state = states[sectionId];

        // get the target state if available
        if ('on' in state) {
            const target = state.on[event];

            if (!target) {
                throw Error(`q-router - Event: "${event}" not found on state: "${sectionId}"`);
            }

            // if we have multiple targets execute the correct one by evaluating their condition
            if (Array.isArray(target)) {
                const targets = target;

                // find a target whose condition evaluates to true, or that has no "cond" attribute (assumed true)
                const index = targets.findIndex(
                    element =>
                        !('cond' in element) ||
                        evaluateCondition(
                            element.cond,
                            extendedState,
                            event,
                            currentState.value,
                            element
                        )
                );

                // Target found
                if (index !== -1) {
                    return {
                        value: targets[index].target,
                        context: extendedState
                    };
                }

                // No target found
                throw Error(
                    `q-router - State "${sectionId}" has no target(s) that evaluate to "true"`
                );
            }

            return {
                value: target,
                context: extendedState
            };
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
