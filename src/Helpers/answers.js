import { parseEntities } from 'parse-entities';

export const getAnswersAndCorrectAnswerIndex = (triviaRound) => {
  const answerIndex = Math.floor(Math.random() * 4);
  const answers = [...triviaRound.incorrect_answers];
  answers.splice(answerIndex, 0, triviaRound.correct_answer);

  const formattedAnswers = answers
    .map(
      (answer, index) =>
        `${String.fromCharCode(index + 65)}. ${parseEntities(answer)}`
    )
    .join('\n');

  const questionContent = '';
  const updatedQuestionContent = '';

  const postQuestionContent = answers
    .map((answer, index) => {
      const letter = String.fromCharCode(index + 65);
      const parsedAnswer = parseEntities(answer);
      const answerText = `${letter}. ${parsedAnswer}`;
      if (answerIndex !== index.toString()) {
        return answerText;
      }
      return `**${answerText}**`;
    })
    .join('\n');

  return {
    postQuestionContent,
    formattedAnswers,
    questionContent,
    updatedQuestionContent,
    answerIndex: answerIndex.toString(),
  };
};
