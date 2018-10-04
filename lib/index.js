const createMachine = require('./extendedFiniteStateMachine');

function qRouter(spec) {
    const questionnaire = spec;
    questionnaire.answers = questionnaire.answers || {};
    questionnaire.history = questionnaire.history || [];

    const fsm = createMachine(questionnaire.routes);
    const lastVisitedSectionId = questionnaire.history[questionnaire.history.length - 1];
    let currentSectionId = lastVisitedSectionId || fsm.initialState.value;

    function getCurrentSectionId() {
        return currentSectionId;
    }

    function wrapEachAnswerInObject(values) {
        // {someKey:123} becomes {someKey:{value: 123}}
        return Object.keys(values).reduce((acc, key) => {
            acc[key] = {value: values[key]};

            return acc;
        }, {});
    }

    function isSectionRepeatable(sectionId) {
        return questionnaire.sections[sectionId]['x-repeatable'];
    }

    function next(event = '', sectionAnswers = {}, startingSectionId = currentSectionId) {
        const processedAnswers = wrapEachAnswerInObject(sectionAnswers);
        const sectionIdAnswerIndex = startingSectionId.split('/');
        let [sectionId] = sectionIdAnswerIndex;
        const [, indexToPopulate] = sectionIdAnswerIndex;

        currentSectionId = sectionId;

        // If this is a repeated question append to an array of answers instead of overwriting existing answer
        if (isSectionRepeatable(sectionId)) {
            const existingAnswers = questionnaire.answers[sectionId] || [];
            let answerCount;

            // Update a specific value
            if (indexToPopulate) {
                existingAnswers[indexToPopulate - 1] = processedAnswers;
                answerCount = indexToPopulate;
            } else {
                answerCount = existingAnswers.push(processedAnswers);
            }

            questionnaire.answers[sectionId] = existingAnswers;

            // Is this the first answer
            if (answerCount > 1) {
                sectionId = `${sectionId}/${answerCount}`;
            }
        } else {
            questionnaire.answers[sectionId] = processedAnswers;
        }

        // Remove all progress entries after the current sectionId
        const existingProgressIndex = questionnaire.history.indexOf(sectionId);

        if (existingProgressIndex > -1) {
            questionnaire.history.length = existingProgressIndex;
        }

        questionnaire.history.push(sectionId);
        currentSectionId = fsm.transition({value: currentSectionId}, event, questionnaire).value;
    }

    function previous() {
        currentSectionId = questionnaire.history.pop();
    }

    return Object.freeze({
        getCurrentSectionId,
        next,
        previous,
        history: questionnaire.history,
        questionnaire
    });
}

module.exports = qRouter;
