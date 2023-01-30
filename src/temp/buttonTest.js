import { SlashCommandBuilder } from 'discord.js';
import { parseEntities } from 'parse-entities';
import { getMultipleChoice } from '../Api/opentdb.js';
import {
  getAnswersAndCorrectAnswerIndex,
  createMulitpleChoiceAnswerButtons,
} from '../Helpers/index.js';

const questionLengthInSeconds = 15;
const questionLength = questionLengthInSeconds * 1000;

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
            if (answerIndex !== index) {
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
      if (counter === 10) {
        clearInterval(myInterval);

        // Get the winner
        await interaction.followUp({
          content: 'The winner',
        });
      }
    }, questionLength);
  },
};

export default ping;

// Someone initiates the game
// create a leaderboard
// fetch the questions/answers
// reply that the game is starting

// have a loop, each one is a followUp with a new collector
// function that creates the buttons with the answers
// add to leaderboard on collect
// on question end, disable the buttons, write the correct answer as a letter and who got it right, or who got it right

// on game end, show the leaderboard top 10 only, or if no winners show a custom message

// Limit the game playing once in a single channel at a time
// optional - stop button on the start message that only the creator can do it, or the moderator
// optional - editable number of leaderboard display
