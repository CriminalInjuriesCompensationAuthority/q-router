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

    function setProgress(sectionId) {
        // Remove all progress entries after the current sectionId
        const existingProgressIndex = questionnaire.progress.indexOf(sectionId);

        if (existingProgressIndex > -1) {
            questionnaire.progress.length = existingProgressIndex;
        }

        questionnaire.progress.push(sectionId);
    }

    function next(event = '', sectionAnswers = {}, startingSectionId = currentSectionId) {
        const processedAnswers = wrapEachAnswerInObject(sectionAnswers);
        const sectionIdAnswerIndex = startingSectionId.split('/');
        let [sectionId, answerIndex] = sectionIdAnswerIndex;

        currentSectionId = sectionId;

        // If this is a repeated question append to an array of answers instead of overwriting existing answer
        if (answerIndex || isSectionRepeatable(sectionId)) {
            const existingAnswers =
                questionnaire.answers[sectionId] || (questionnaire.answers[sectionId] = []);

            // Update a specific value
            if (answerIndex) {
                existingAnswers[answerIndex - 1] = processedAnswers;
            } else {
                answerIndex = existingAnswers.push(processedAnswers);
            }

            // Is this the first answer
            if (answerIndex > 1) {
                sectionId = `${sectionId}/${answerIndex}`;
            }
        } else {
            questionnaire.answers[sectionId] = processedAnswers;
        }

        setProgress(sectionId);

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
