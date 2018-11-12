function noCascade(rule, data) {
    const stateIdToFind = rule[1];
    const {progress} = data;
    const {states} = data.routes;

    function stateNotInCondition(stateId, condition) {
        return condition.every(value => {
            if (Array.isArray(value)) {
                return stateNotInCondition(stateId, value);
            }

            const valueAsString = String(value);

            return valueAsString.indexOf(`.${stateId}.`) === -1 && valueAsString !== stateId;
        });
    }

    function setProgress(sectionId) {
        // Remove all progress entries after the current sectionId
        const existingProgressIndex = progress.indexOf(sectionId);

        if (existingProgressIndex > -1) {
            progress.length = existingProgressIndex;
        }

        progress.push(sectionId);
    }

    const isNoCascade = Object.keys(states).every(stateId => {
        const state = states[stateId];

        if (stateId === stateIdToFind || !('on' in state) || !('ANSWER' in state.on)) {
            return true;
        }

        const answerEventTransition = state.on.ANSWER;

        // can either be a single transition or an array or transitions
        if (!answerEventTransition || typeof answerEventTransition === 'string') {
            return true;
        }

        if (Array.isArray(answerEventTransition)) {
            return answerEventTransition.every(transition => {
                if ('cond' in transition) {
                    return stateNotInCondition(stateIdToFind, transition.cond);
                }

                return true;
            });
        }

        if ('cond' in answerEventTransition) {
            return stateNotInCondition(stateIdToFind, answerEventTransition.cond);
        }

        return true;
    });

    if (isNoCascade === false) {
        setProgress(stateIdToFind);
    }

    return isNoCascade;
}

module.exports = noCascade;
