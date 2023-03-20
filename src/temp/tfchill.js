import { SlashCommandBuilder } from 'discord.js';
import { getTrueFalse } from '../Api/opentdb.js';
import { getContentAndCorrectAnswerIndex } from '../Helpers/answers.js';
import { createTrueFalseAnswerButtons } from '../Helpers/buttons.js';
import { createGameStartMessages } from '../Helpers/messages.js';
import { getWinner } from '../Helpers/winner.js';
import {QUESTION_LENGTH_IN_SECONDS, QUESTION_LENGTH, ROUNDS} from '../Constants/index.js';


const mcchill = {
  data: new SlashCommandBuilder()
    .setName('tfchill')
    .setDescription(`Starts a True or False Choice quiz, where each question lasts for ${QUESTION_LENGTH_IN_SECONDS} seconds`),
  async execute(interaction) {
    let triviaData;
    try {
      triviaData = await getTrueFalse();
    } catch (e) {
      console.log(e);
      await interaction.reply({
        content:
          'Uh oh, something has gone wrong while trying to get some questions. Please try again',
      });
      return;
    }

    const { initialMessage, updatedMessage } = createGameStartMessages(
      interaction.user.id,
      QUESTION_LENGTH_IN_SECONDS
    );

    await interaction.reply({
      content: initialMessage,
    });

    const leaderBoard = new Map();
    let haveUpdatedOriginalMessage = false;
    let counter = 0;

    const myInterval = setInterval(async () => {
      if (!haveUpdatedOriginalMessage) {
        await interaction.editReply({
          content: updatedMessage,
        });
      }
      haveUpdatedOriginalMessage = true;
      const triviaRound = triviaData[counter];

      const { answerIndex, questionContent, generateUpdatedQuestionContent } =
        getContentAndCorrectAnswerIndex(triviaRound);

      const answerButtons = createTrueFalseAnswerButtons();
      const questionInteraction = await interaction.followUp({
        content: questionContent,
        components: [answerButtons],
      });
      const collector = interaction.channel.createMessageComponentCollector({
        // Component type button
        componentType: 2,
        // Gives time for the question to end before the next question starts
        time: QUESTION_LENGTH - 1000,
      });
      let correctAnswerCount = 0;
      let incorrectAnswerCount = 0;
      const usersThatHaveAnsweredQuestion = new Set();
      collector.on('collect', async (i) => {
        const userId = i.user.id;

        if (usersThatHaveAnsweredQuestion.has(userId)) {
          return;
        }
        usersThatHaveAnsweredQuestion.add(userId);

        const buttonId = i.customId;
        const isCorrect = buttonId === answerIndex;

        if (isCorrect) {
          const currentScore = leaderBoard.get(userId) || 0;
          leaderBoard.set(userId, currentScore + 1);
          correctAnswerCount++;
        } else {
          incorrectAnswerCount++;
        }
        i.reply({
          content: isCorrect ? 'Correct' : 'Wrong',
          ephemeral: true,
        });
      });
      collector.on('end', () => {
        const totalAnswers = correctAnswerCount + incorrectAnswerCount;
        const correctMessage = `${correctAnswerCount}/${totalAnswers} guessed correctly`;

        questionInteraction.edit({
          content: generateUpdatedQuestionContent(correctMessage),
          components: [],
        });
      });

      counter++;
      if (counter === ROUNDS) {
        clearInterval(myInterval);

        setTimeout(async () => {
          const winnerText = getWinner(leaderBoard);

          await interaction.followUp({
            content: `Game has ended\n${winnerText}`,
          });
        }, QUESTION_LENGTH);
      }
    }, QUESTION_LENGTH);
  },
};

export default mcchill;