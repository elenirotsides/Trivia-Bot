import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from 'discord.js';
import { getMultipleChoice } from '../Api/opentdb.js';

const ping = {
  data: new SlashCommandBuilder()
    .setName('buttons')
    .setDescription('Shows example buttons and reponds to clicks'),
  async execute(interaction) {
    const button = new ButtonBuilder()
      .setCustomId('1')
      .setLabel('Answer 1')
      .setStyle(ButtonStyle.Primary);
    const button2 = new ButtonBuilder()
      .setCustomId('2')
      .setLabel('Answer 2')
      .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder({ components: [button, button2] });
    // const filter = i => {
    //   i.deferUpdate();s
    //   return i.user.id === message.author.id;
    // };

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

    const msg = await interaction.reply({
      content: `${'User'} has started the game`,
      components: [row],
    });

    // for (const question of triviaData) {
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: 2,
      time: 15000,
    });
    const answers = {};
    collector.on('collect', (i) => {
      console.log('Collecting')
      const user = i.user.id;
      const buttonId = i.customId;

      if (answers[user]) {
        i.reply({ content: 'You have already answered', ephemeral: true });
      } else {
        answers[user] = buttonId;
        i.reply({ content: 'Got it', ephemeral: true });
      }
    });
    collector.on('end', (collected) => {
      interaction.deleteReply();
    });
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
