import { MessageEmbed } from 'discord.js';
import Command from '../Structures/Command.js';

export default class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ['halp', 'hwlp', 'hrlp'],
            description: "Displays all the bot's commands",
            category: 'Utilities',
            usage: '[command]',
        });
    }

    async run(message, commands) {
        const embed = new MessageEmbed()
            .setColor('#fb94d3')
            .setAuthor({ name: `Help Menu`, iconURL: message.guild === null ? null : message.guild.iconURL({ dynamic: true }) })
            .setThumbnail(this.client.user.displayAvatarURL())
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        if (commands.length > 0) {
            // only consider the first command that a user asks for help on to avoid spam
            const cmd = this.client.commands.get(commands[0]) || this.client.commands.get(this.client.aliases.get(commands[0]));

            if (!cmd) {
                try {
                    message.channel.send({ content: `No command named: \`${commands[0]}\` exists` });
                    return;
                } catch (e) {
                    console.log(e);
                    return;
                }
            }

            embed.setAuthor({
                name: `Command Help: ${commands[0]}`,
                iconURL: message.guild === null ? null : message.guild.iconURL({ dynamic: true }),
            });
            embed.setDescription(
                `**❯ Aliases:** ${cmd.aliases.length ? cmd.aliases.map((alias) => `\`${alias}\``).join(' ') : 'No Aliases'}\n**❯ Description:** ${
                    cmd.description
                }\n**❯ Category:** ${cmd.category}\n**❯ Usage:** ${cmd.usage}`
            );

            try {
                message.channel.send({ embeds: [embed] });
                return;
            } catch (e) {
                console.log(e);
                return;
            }
        } else {
            // This will be necessary later when I implement multi word commands
            // `Command Parameters: \`<>\` is strict & \`[]\` is optional`,
            embed.setDescription(
                `❯ The bot's prefix is: ${this.client.prefix}\n❯ For more detailed information on a specific command, type \`!help\` followed by any of the commands listed below\n\n**These are the available commands for Trivia Bot:**\n`
            );
            let categories;
            if (!this.client.owners.includes(message.author.id)) {
                categories = this.client.utils.removeDuplicates(
                    this.client.commands.filter((cmd) => cmd.category !== 'Owner').map((cmd) => cmd.category)
                );
            } else {
                categories = this.client.utils.removeDuplicates(this.client.commands.map((cmd) => cmd.category));
            }

            for (const category of categories) {
                embed.addField(
                    `**${category}**`,
                    this.client.commands
                        .filter((cmd) => cmd.category === category)
                        .map((cmd) => `\`${cmd.name}\``)
                        .join(' ')
                );
            }
            try {
                message.channel.send({ embeds: [embed] });
                return;
            } catch (e) {
                console.log(e);
                return;
            }
        }
    }
}
