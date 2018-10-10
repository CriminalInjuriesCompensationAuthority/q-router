const createMachine = require('./extendedFiniteStateMachine');

function qRouter(spec) {
    const questionnaire = spec;
    questionnaire.answers = questionnaire.answers || {};
    questionnaire.progress = questionnaire.progress || [];

    const fsm = createMachine(questionnaire.routes);
    const lastVisitedSectionId = questionnaire.progress[questionnaire.progress.length - 1];
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
        return 'repeatable' in questionnaire.routes.states[sectionId];
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
        const existingProgressIndex = questionnaire.progress.indexOf(sectionId);

        if (existingProgressIndex > -1) {
            questionnaire.progress.length = existingProgressIndex;
        }

        questionnaire.progress.push(sectionId);
        currentSectionId = fsm.transition({value: currentSectionId}, event, questionnaire).value;
    }

    function previous() {
        currentSectionId = questionnaire.progress.pop();
    }

    return Object.freeze({
        getCurrentSectionId,
        next,
        previous,
        progress: questionnaire.progress,
        questionnaire
    });
}

module.exports = qRouter;
