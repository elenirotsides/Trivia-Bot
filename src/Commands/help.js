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
            .setAuthor(`Help Menu`, message.guild === null ? null : message.guild.iconURL({ dynamic: true }))
            .setThumbnail(this.client.user.displayAvatarURL())
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        if (commands.length > 0) {
            const cmd = this.client.commands.get(commands[0]) || this.client.commands.get(this.client.aliases.get(commands[0]));
            if (!cmd) return message.channel.send(`No command named: \`${commands[0]}\` exists`);
            embed.setAuthor(`Command Help: ${commands[0]}`, message.guild === null ? null : message.guild.iconURL({ dynamic: true }));
            embed.setDescription([
                `**❯ Aliases:** ${cmd.aliases.length ? cmd.aliases.map((alias) => `\`${alias}\``).join(' ') : 'No Aliases'}`,
                `**❯ Description:** ${cmd.description}`,
                `**❯ Category:** ${cmd.category}`,
                `**❯ Usage:** ${cmd.usage}`,
            ]);

            return message.channel.send(embed);
        } else {
            embed.setDescription([
                `These are the available commands for Trivia Bot`,
                `The bot's prefix is: ${this.client.prefix}`,
                // This will be necessary later when I implement multi word commands
                // `Command Parameters: \`<>\` is strict & \`[]\` is optional`,
                `For more detailed information on a specific command, type \`!help\` followed by any of the commands listed below`,
            ]);
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
            return message.channel.send(embed);
        }
    }
}
