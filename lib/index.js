const createMachine = require('./extendedFiniteStateMachine');

function qRouter(spec) {
    const questionnaire = spec;
    questionnaire.answers = questionnaire.answers || {};
    questionnaire.progress = questionnaire.progress || [];

    const fsm = createMachine(questionnaire.routes);
    const lastVisitedSectionId = questionnaire.progress[questionnaire.progress.length - 1];
    let currentSectionId = lastVisitedSectionId || fsm.initialState.value;

    function wrapEachAnswerInObject(values) {
        // {someKey:123} becomes {someKey:{value: 123}}
        return Object.keys(values).reduce((acc, key) => {
            acc[key] = {value: values[key]};

            return acc;
        }, {});
    }

    function isSectionRepeatable(sectionId) {
        return 'repeatable' in questionnaire.routes.states[sectionId];
    }

    function setProgress(sectionId) {
        // Remove all progress entries after the current sectionId
        const existingProgressIndex = questionnaire.progress.indexOf(sectionId);

        if (existingProgressIndex > -1) {
            questionnaire.progress.length = existingProgressIndex;
        }

        questionnaire.progress.push(sectionId);
    }

    /**
     * Gets the current section ID
     * @returns {String} - Current section ID
     */
    function current() {
        return currentSectionId;
    }

    /**
     * Gets the next section ID
     * @param {String} event - Type of action e.g. ANSWER / EDIT
     * @param {Object} sectionAnswers - Object literal containing questionId:answer pairs
     * @param {String} [startingSectionId] - A section ID to store the answers against
     * @returns {String} - Next section ID
     */
    function next(event, sectionAnswers = {}, startingSectionId = currentSectionId) {
        const processedAnswers = wrapEachAnswerInObject(sectionAnswers);
        const [sectionId, answerIndex] = startingSectionId.split('/');

        setProgress(startingSectionId);

        if (answerIndex) {
            questionnaire.answers[sectionId][answerIndex - 1] = processedAnswers;
        } else if (isSectionRepeatable(sectionId)) {
            questionnaire.answers[sectionId] = [processedAnswers];
        } else {
            questionnaire.answers[sectionId] = processedAnswers;
        }

        currentSectionId = fsm.transition({value: sectionId}, event, questionnaire).value;

        if (isSectionRepeatable(currentSectionId)) {
            const existingAnswers = questionnaire.answers[currentSectionId];

            if (existingAnswers && existingAnswers.length) {
                currentSectionId = `${currentSectionId}/${existingAnswers.length + 1}`;
            }
        }

        return currentSectionId;
    }

    /**
     * Gets the previous section ID according to the routing progress
     * @returns {String} - Previous section ID
     */
    function previous() {
        currentSectionId = questionnaire.progress.pop();
        return currentSectionId;
    }

    return Object.freeze({
        current,
        next,
        previous,
        progress: questionnaire.progress,
        questionnaire
    });
}

module.exports = qRouter;
