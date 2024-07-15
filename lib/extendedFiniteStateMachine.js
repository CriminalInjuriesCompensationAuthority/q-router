'use strict';

const qExpression = require('q-expressions');

function createMachine(spec) {
    const {
        states,
        evaluateCondition = (cond, extendedStateObject /* , eventObject, sectionId, guard */) =>
            qExpression.evaluate(cond, extendedStateObject)
    } = spec;
    const initialState = {
        value: spec.initial,
        context: spec.context
    };

    function matchesWildcardRule(rule, testString) {
        const escapeRegex = str => str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
        return new RegExp(
            `^${rule
                .split('*')
                .map(escapeRegex)
                .join('.*')}$`
        ).test(testString);
    }

    function getFirstMatchingEventName(transitionEventsArray, event) {
        if (transitionEventsArray.includes(event)) {
            return event;
        }
        return transitionEventsArray.find(transitionEventName => {
            return matchesWildcardRule(transitionEventName, event);
        });
    }

    // { section1: {} } { type: 'ANSWER' } section1
    function transition(currentState, event, extendedState) {
        // find the currentState
        const sectionId = currentState.value;
        const state = states[sectionId];

        let eventName = event;
        // get the target state if available
        if (state && 'on' in state) {
            // if (isWildcardTransition(event)) {
            eventName = getFirstMatchingEventName(Object.keys(state.on), event);
            // }
            const target = state.on[eventName];

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
