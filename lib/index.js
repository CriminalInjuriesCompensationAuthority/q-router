// const { Machine, State } = require('xstate');

const jr = require('json-rules')();

function Machine(spec) {
    const {
        states,
        evaluateCondition = (cond, extendedStateObject /* , eventObject, stateId, guard */) =>
            jr.evaluate(cond, extendedStateObject.answers)
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

jr.addOperator(
    'answeredLessThan',
    (rule, data) => {
        function findAnswer(questionId, sectionAnswers) {
            let answer;

            Object.keys(data).forEach(sectionId => {
                const section = sectionAnswers[sectionId];

                // Section will be an array or objects (repeated section) or a single object
                // Only interested in single answers at the moment
                if (!Array.isArray(section)) {
                    // does this section have the answer
                    if (questionId in section) {
                        answer = section[questionId].value;
                    }
                }
            });

            return answer;
        }

        const answerRef = rule[1];
        const answerCount = data[answerRef].length;
        const answer = typeof rule[2] === 'number' ? rule[2] : findAnswer(rule[2], data);

        return answerCount < answer;
    },
    true
);

function qRouter(spec) {
    const {routes} = spec;
    const machine = Machine(routes);
    let currentState = machine.initialState;
    const stack = [];
    const extendedState = spec;

    // if no answers exists create an object to store them against
    extendedState.answers = extendedState.answers || {};

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

        let stateId = currentState.value;
        let valueIndex = 0;

        // Check if the stateId contains a reference to a specific array index to update
        if (stateId.indexOf('/') > -1) {
            const stateIdData = stateId.split('/');
            [stateId] = stateIdData;
            [, valueIndex] = stateIdData;

            currentState.value = stateId;
        }

        // If this is a repeated question append to an array of answers instead of overwriting existing answer
        if (extendedState.sections[stateId]['x-repeatable']) {
            const answers = extendedState.answers[currentState.value] || [];
            let answerCount;

            // Update a specific value
            if (valueIndex) {
                answers[valueIndex - 1] = processedValues;
                answerCount = valueIndex;
            } else {
                answerCount = answers.push(processedValues);
            }

            // Is this the first answer
            if (answerCount > 1) {
                stateId = `${currentState.value}/${answerCount}`;
            }
            extendedState.answers[currentState.value] = answers;
        } else {
            extendedState.answers[currentState.value] = processedValues;
        }

        stack.push(stateId);
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
