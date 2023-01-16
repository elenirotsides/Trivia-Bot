import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from 'discord.js';
import { getMultipleChoice } from '../Api/opentdb.js';
import { parseEntities } from 'parse-entities';
import {
  getAnswersAndCorrectAnswerIndex,
  createMulitpleChoiceAnswerButtons,
} from '../Helpers/index.js';

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

    const leaderBoard = {};

    await interaction.reply({
      content: `${'User'} has started the game`,
    });

    let counter = 0;
    const myInterval = setInterval(async () => {
      const question = triviaData[counter];

      const { answers, answerIndex } =
        getAnswersAndCorrectAnswerIndex(question);
      const answerButtons = createMulitpleChoiceAnswerButtons();
      const formattedAnswers = answers
        .map((answer, index) => `${index + 1}. ${parseEntities(answer)}`)
        .join('\n');

      const content = `${parseEntities(
        question.question
      )}\n${formattedAnswers}`;

      await interaction.followUp({ content, components: [answerButtons] });
      const collector = interaction.channel.createMessageComponentCollector({
        // Component type button
        componentType: 2,
        time: 15000,
      });
      collector.on('collect', (i) => {
        console.log('Collecting');
        // const userId = i.user.id;
        const buttonId = i.customId;
        const isCorrect = buttonId === answerIndex;
        i.reply({ content: isCorrect ? 'Correct' : 'Wrong', ephemeral: true });

        // if (answers[user]) {
        //   i.reply({ content: 'You have already answered', ephemeral: true });
        //   return;
        // }
      });
      collector.on('end', (collected) => {
        interaction.deleteReply();
      });

      counter++;
      if (counter === 10) {
        clearInterval(myInterval);
      }
    }, 10000);

    // for (const question of triviaData) {

    const answers = {};

    // };
    console.log('done');

    // await interaction.followUp({content: 'Question 1', components: [row2]});
    // await interaction.followUp('Question 2');
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
