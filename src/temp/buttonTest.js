import { SlashCommandBuilder } from 'discord.js';
import { parseEntities } from 'parse-entities';
import { getMultipleChoice } from '../Api/opentdb.js';
import { getAnswersAndCorrectAnswerIndex } from '../Helpers/answers.js';
import { createMulitpleChoiceAnswerButtons } from '../Helpers/buttons.js';
import { createGameStartMessages } from '../Helpers/messages.js';

const questionLengthInSeconds = 5;
const questionLength = questionLengthInSeconds * 1000;
const rounds = 10;

const ping = {
  data: new SlashCommandBuilder()
    .setName('buttons')
    .setDescription('Shows example buttons and reponds to clicks'),
  async execute(interaction) {
    let triviaData;
    try {
      triviaData = await getMultipleChoice();
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
      questionLengthInSeconds
    );

    const leaderBoard = new Map();
    await interaction.reply({
      content: initialMessage,
    });
    let haveUpdatedOriginalMessage = false;

    let counter = 0;
    const myInterval = setInterval(async () => {
      if (!haveUpdatedOriginalMessage) {
        await interaction.editReply({
          content: updatedMessage,
        });
      }
      haveUpdatedOriginalMessage = true;
      const question = triviaData[counter];

      const { answerIndex, formattedAnswers, postQuestionContent } =
        getAnswersAndCorrectAnswerIndex(question);

      const parsedQuestion = parseEntities(question.question);

      const content = `${parsedQuestion}\n${formattedAnswers}`;

      const answerButtons = createMulitpleChoiceAnswerButtons();
      const questionInteraction = await interaction.followUp({
        content,
        components: [answerButtons],
      });
      const collector = interaction.channel.createMessageComponentCollector({
        // Component type button
        componentType: 2,
        // Gives time for the question to end before the next question starts
        time: questionLength - 1000,
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
          content: `${parsedQuestion}\n${postQuestionContent}\n${correctMessage}`,
          components: [],
        });
      });

      counter++;
      if (counter === rounds) {
        clearInterval(myInterval);

        setTimeout(async () => {
          const winnerText =
            Object.entries(Object.fromEntries(leaderBoard))
              .map(([key, value]) => ({ id: key, score: value }))
              .sort((a, b) => (a.score < b.score ? 1 : -1))
              .map(
                ({ id, score }, index) =>
                  `${index + 1}. ${`<@${id}>`} - ${score}`
              )
              .join('\n') || 'There was no winner';

          await interaction.followUp({
            content: `Game has ended\n${winnerText}`,
          });
        }, questionLength);
      }
    }, questionLength);
  },
};

export default ping;


// A bit more refactoring - move the question into the answers.js
// Answer not being bold
