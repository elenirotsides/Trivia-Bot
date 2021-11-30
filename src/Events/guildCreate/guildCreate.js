import Event from '../../Structures/Event.js';
import { MessageEmbed } from 'discord.js';

export default class extends Event {
    async run(guild) {
        console.log(`Added to a server! Now in ${this.client.guilds.cache.size} servers.`);

        const embed = new MessageEmbed()
            .setColor('#fb94d3')
            .setTitle("Thanks for the invite, I'm Trivia Bot! 🧠")
            .setDescription(
                'My prefix is `!` \n A list of commands can be found by sending `!help` \n \n [**Support Server**](https://discord.gg/wsyUhnDrmd) Questions? Join if you need help!' +
                    "\n [**GitHub**](https://github.com/elenirotsides/Trivia-Bot) Are you a developer looking to support another fellow developer? Give me a star and I'll be eternally grateful!" +
                    '\n [**Bug Reports/Feature Requests**](https://github.com/elenirotsides/Trivia-Bot/issues) You can submit bug reports or request features here.' +
                    '\n [**Top.gg**](https://top.gg/bot/831974682709721099) Do you like Trivia Bot? Please consider voting and leaving a rating!'
            )
            .setThumbnail(this.client.user.displayAvatarURL())
            .setFooter('Yours truly, Trivia Bot ❤️')
            .setTimestamp();

        guild.systemChannel.send(embed);
    }
}
