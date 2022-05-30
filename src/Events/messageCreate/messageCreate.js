import Event from '../../Structures/Event.js';

export default class extends Event {
    async run(message) {
        const mentionRegex = RegExp(`^<@!${this.client.user.id}>$`);
        const mentionRegexPrefix = RegExp(`^<@!${this.client.user.id}> `);

        if (message.author.bot) return;

        if (message.content.toLocaleLowerCase().includes('trivia')) {
            let responseArray = [
                'Did someone say my name?',
                'You called?',
                'Looking for me?',
                'You know you wanna play...',
                'What are you waiting for, play some trivia!',
                'If you ever forget how to use me, just type `!help`',
            ];
            let randomIndex = Math.floor(Math.random() * responseArray.length);

            try {
                message.channel.send({ content: responseArray[randomIndex] });
            } catch (e) {
                console.log(e);
            }
        }

        if (message.content.match(mentionRegex))
            message.channel.send({ content: `My prefix for ${message.guild.name} is \`${this.client.prefix}\`.` });

        const prefix = message.content.match(mentionRegexPrefix) ? message.content.match(mentionRegexPrefix)[0] : this.client.prefix;

        if (!message.content.startsWith(prefix)) return;

        const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

        const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));

        if (command) {
            command.run(message, args);
        }
    }
}
