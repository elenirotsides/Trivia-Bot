import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder().setName('ping').setDescription('Responds pong'),

    async execute(interaction) {
        interaction.reply({ content: 'Pong!' });
    },
};
