import { parseEntities } from 'parse-entities';

// getDisplayQuestionsAndAnswers

export const getContentAndCorrectAnswerIndex = (triviaRound) => {
  const answerIndex = Math.floor(Math.random() * 4);
  const answers = [...triviaRound.incorrect_answers];
  answers.splice(answerIndex, 0, triviaRound.correct_answer);

  const displayAnswers = answers
    .map(
      (answer, index) =>
        `${String.fromCharCode(index + 65)}. ${parseEntities(answer)}`
    )
    .join('\n');

  const parsedQuestion = parseEntities(triviaRound.question);
  const questionContent = `${parsedQuestion}\n${displayAnswers}`;

  const displayAnswersWithCorrectAnswer = answers
    .map((answer, index) => {
      const letter = String.fromCharCode(index + 65);
      const parsedAnswer = parseEntities(answer);
      const answerText = `${letter}. ${parsedAnswer}`;
      if (answerIndex !== index) {
        return answerText;
      }
      return `**${answerText}**`;
    })
    .join('\n');
  const generateUpdatedQuestionContent = (correctMessage) =>
    `${parsedQuestion}\n${displayAnswersWithCorrectAnswer}\n${correctMessage}`;

  return {
    questionContent,
    generateUpdatedQuestionContent,
    answerIndex: answerIndex.toString(),
  };
};
