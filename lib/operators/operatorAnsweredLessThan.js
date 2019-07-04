'use strict';

function answeredLessThan(rule, data) {
    function findAnswer(questionId, sectionAnswers) {
        let answer;

        Object.keys(data.answers).forEach(sectionId => {
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
    const answerCount = data.answers[answerRef].length;
    const answer = typeof rule[2] === 'number' ? rule[2] : findAnswer(rule[2], data.answers);

    return answerCount < answer;
}

module.exports = answeredLessThan;
