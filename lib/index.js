const createMachine = require('./extendedFiniteStateMachine');

function qRouter(spec) {
    const questionnaire = Object.assign({}, spec);
    const fsm = createMachine(questionnaire.routes);
    questionnaire.answers = questionnaire.answers || {};
    questionnaire.progress = questionnaire.progress || [fsm.initialState.value];

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

    function isSectionAvailable(sectionId) {
        return questionnaire.progress.includes(sectionId);
    }

    /**
     * Gets the current section ID and context
     * @returns {Object} sectionInfo - Current section ID and context
     * @returns {string} [sectionInfo.id] - ID of current section
     * @returns {Object} [sectionInfo.context] - Current state (questionnaire) to get to this section ID
     */
    function current() {
        return {
            id: questionnaire.progress[questionnaire.progress.length - 1],
            context: questionnaire
        };
    }

    /**
     * Sets the current progress to the supplied section id.
     * If the section id already exists, all progress after
     * the supplied section id will be removed.
     * @param {String} sectionId - ID to make current
     * @returns {Object} sectionInfo - Current section ID and context
     * @returns {string} [sectionInfo.id] - ID of current section
     * @returns {Object} [sectionInfo.context] - Current state (questionnaire) to get to this section ID
     */
    function setProgress(sectionId) {
        const section = current();

        if (sectionId === section.id) {
            return section;
        }

        const existingProgressIndex = questionnaire.progress.indexOf(sectionId);

        if (existingProgressIndex > -1) {
            questionnaire.progress.length = existingProgressIndex;
        }

        questionnaire.progress.push(sectionId);

        return current();
    }

    /**
     * Gets the next section ID
     * @param {String} event - Type of action e.g. ANSWER / EDIT
     * @param {Object} sectionAnswers - Object literal containing questionId:answer pairs
     * @param {String} [startingSectionId] - A section ID to store the answers against
     * @returns {Object} sectionInfo - Next section ID and context
     * @returns {string} [sectionInfo.id] - ID of current section
     * @returns {Object} [sectionInfo.context] - Current state (questionnaire) to get to this section ID
     */
    function next(event, sectionAnswers = {}, startingSectionId) {
        if (startingSectionId) {
            if (isSectionAvailable(startingSectionId)) {
                // EDIT events can jump back to summary section. Don't change progress.
                if (event !== 'EDIT') {
                    setProgress(startingSectionId);
                }
            } else {
                throw Error(
                    `Failed to set the current section to id: "${startingSectionId}". This section has not yet been visited.`
                );
            }
        } else {
            // eslint-disable-next-line
            startingSectionId = current().id;
        }

        const processedAnswers = wrapEachAnswerInObject(sectionAnswers);
        const [sectionId, answerIndex] = startingSectionId.split('/');

        if (answerIndex) {
            questionnaire.answers[sectionId][answerIndex - 1] = processedAnswers;
        } else if (isSectionRepeatable(sectionId)) {
            questionnaire.answers[sectionId] = [processedAnswers];
        } else {
            questionnaire.answers[sectionId] = processedAnswers;
        }

        const state = fsm.transition({value: sectionId}, event, questionnaire);
        let currentSectionId = state.value;

        // If editing an answer that results in a cascade and the next section is also a repeating section, don't add "/number" to it.
        // e.g. a repeating section: "some-section-id" does not become "some-section-id/99"
        // This ensures it routes to the first instance of the repeat
        if (event !== 'EDIT' && isSectionRepeatable(currentSectionId)) {
            const existingAnswers = questionnaire.answers[currentSectionId];

            if (existingAnswers && existingAnswers.length) {
                currentSectionId = `${currentSectionId}/${existingAnswers.length + 1}`;
            }
        }

        setProgress(currentSectionId);

        return current();
    }

    /**
     * Gets the previous section ID and context according to the routing progress
     * @returns {Object} sectionInfo - Previous section ID and context
     * @returns {string} [sectionInfo.id] - ID of current section
     * @returns {Object} [sectionInfo.context] - Current state (questionnaire) to get to this section ID
     */
    function previous() {
        questionnaire.progress.pop();

        return {
            id: questionnaire.progress[questionnaire.progress.length - 1],
            context: questionnaire
        };
    }

    return Object.freeze({
        current,
        next,
        previous
    });
}

module.exports = qRouter;
