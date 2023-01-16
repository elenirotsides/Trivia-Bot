import { ActionRowBuilder, ButtonStyle, ButtonBuilder } from 'discord.js';

export const getAnswersAndCorrectAnswerIndex = (triviaRound) => {
  const answerIndex = Math.floor(Math.random() * 4);
  const answers = [...triviaRound.incorrect_answers]
  answers.splice(answerIndex, 0, triviaRound.correct_answer)
  return { answers, answerIndex }
}

const createAnswerButtons = (answers) => {
  const answerButtons = answers.map((answer, index) => new ButtonBuilder()
    .setCustomId(index)
    .setLabel(answer)
    .setStyle(ButtonStyle.Primary))
  return new ActionRowBuilder({ components: [answerButtons] })
}

export const createTrueFalseAnswerButtons = () => {
  const trueFalseAnswers = ['True', 'False']
  return createAnswerButtons(trueFalseAnswers)
}

export const createMulitpleChoiceAnswerButtons = () => {
  const mulitpleChoiceAnswers = ['A', 'B', 'C', 'D']
  return createAnswerButtons(mulitpleChoiceAnswers)
}