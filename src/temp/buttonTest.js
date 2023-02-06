import { SlashCommandBuilder } from 'discord.js';
import { parseEntities } from 'parse-entities';
import { getMultipleChoice } from '../Api/opentdb.js';
import {
  getAnswersAndCorrectAnswerIndex,
  createMulitpleChoiceAnswerButtons,
} from '../Helpers/index.js';

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

    const leaderBoard = new Map();

    await interaction.reply({
      content: `${interaction.user.username} has started the game\nGame will start in ${questionLengthInSeconds} seconds`,
    });

    let counter = 0;
    const myInterval = setInterval(async () => {
      const question = triviaData[counter];

      const { answers, answerIndex } =
        getAnswersAndCorrectAnswerIndex(question);
      const answerButtons = createMulitpleChoiceAnswerButtons();
      const formattedAnswers = answers
        .map(
          (answer, index) =>
            `${String.fromCharCode(index + 65)}. ${parseEntities(answer)}`
        )
        .join('\n');

      const content = `${parseEntities(
        question.question
      )}\n${formattedAnswers}`;

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
      collector.on('collect', (i) => {
        const userId = i.user.id;
        if (usersThatHaveAnsweredQuestion.has(userId)) {
          return;
        }
        usersThatHaveAnsweredQuestion.add(userId);

        const buttonId = i.customId;
        const isCorrect = buttonId === answerIndex;

        if (isCorrect) {
          // Change the value to be the score and the ID
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

        questionInteraction.edit({
          content: `${postQuestionContent}\n${correctMessage}`,
          components: [],
        });
      });

      counter++;
      if (counter === rounds) {
        clearInterval(myInterval);

        const winnerText = Object.entries(leaderBoard)
          .map(([key, value]) => ({ id: key, score: value }))
          .sort((a, b) => (a.score < b.score ? 1 : -1))
          .map(({ id, score }, index) => `${index + 1}. ${id} - ${score}`)
          .join('\n');

        await interaction.followUp({
          content: winnerText,
        });
      }
    }, questionLength);
  },
};

export default ping;

// Game is not ending properly
// Not displaying winner, or leaderboard - done, but cant test because of above issue
// Say game has started in original message
// Game is saying who the winner is before game ends
