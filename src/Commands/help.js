import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import commandList from '../bot.js';

const help = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription("Learn more about Trivia Bot's commands"),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#fb94d3')
            .setAuthor({
                name: 'Help Menu 🧠',
                iconURL: interaction.guild === null ? null : interaction.guild.icon,
            })
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setDescription(
                `${commandList.map((cmd) => `\`${cmd.name}\` ${cmd.description}\n`).join('\n')}`
            )
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};

export default help;
