import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const info = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Displays extra info related to Trivia Bot that might be useful'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#fb94d3')
            .setTitle("Hi, I'm Trivia Bot! 🧠")
            .setDescription(
                '[**Support Server**](https://discord.gg/wsyUhnDrmd) Questions? Join if you need help!' +
                    "\n [**GitHub**](https://github.com/elenirotsides/Trivia-Bot) Are you a developer looking to support another fellow developer? Give me a star and I'll be eternally grateful!" +
                    '\n [**Bug Reports/Feature Requests**](https://github.com/elenirotsides/Trivia-Bot/issues) You can submit bug reports or request features here.' +
                    '\n [**Top.gg**](https://top.gg/bot/831974682709721099) Do you like Trivia Bot? Please consider voting and leaving a rating!'
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Yours truly, Trivia Bot ❤️' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

export default info;
