// import Command from '../Structures/Command';
// import { MessageEmbed } from 'discord.js';

// export default class extends Command {
//     constructor(...args) {
//         super(...args, {
//             aliases: ['halp', 'hwlp', 'hrlp'],
//             description: "Displays all the bot's commands",
//             category: 'Utilities',
//             usage: '[command]',
//         });
//     }

//     async run(message, [command]) {
//         const embed = new MessageEmbed();
//         embed
//             .setColor('#fb94d3')
//             .setAuthor(`${message.guild.name} Help Menu`, message.guild.iconURL({ dynamic: true }))
//             .setThumbnail(this.client.user.displayAvatarURL())
//             .setTitle('How to use Trivia Bot')
//             .addFields(
//                 { name: '`!help`', value: 'Display all the commands' },
//                 { name: '`!play tf help`', value: 'Gives more detail on the different modes in a T/F game' },
//                 { name: '`!play mc help`', value: 'Gives more detail on the different modes in a Multiple Choice game' },
//                 { name: '`!play tf chill`', value: 'Starts a round of chill T/F Trivia' },
//                 { name: '`!play mc chill`', value: 'Starts a round of chill Multiple Choice Trivia' },
//                 { name: '`!play tf competitive`', value: 'Starts a round of competitive T/F Trivia' },
//                 { name: '`!play mc competitive`', value: 'Starts a round of competitive Multiple Choice Trivia' },
//                 { name: '🛑', value: 'During the game, stop the game completely and tally the current totals by pressing this emoji reaction' }
//             )
//             .setFooter(`Asked by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
//             .setTimestamp();

//         if (command) {
//             const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

//             if (!cmd) {
//                 return message.channel.send(`Invalid command: \`${command}\``);
//             }

//             embed.setAuthor(`${this.client.utils.capitalise(cmd.name)} Command Help`, this.client.user.displayAvatarURL());
//             embed.setDescription([
//                 `**❯ Aliases:** ${cmd.aliases.length ? cmd.aliases.map((alias) => `\`${alias}\``).join(' ') : 'No Aliases'}`,
//                 `**❯ Description:** ${cmd.description}`,
//                 `**❯ Category:** ${cmd.category}`,
//                 `**❯ Usage:** ${cmd.usage}`,
//             ]);

//             return message.channel.send(embed);
//         } else {
//             //TODO
//             // message.channel.send('Whoops something went wrong');
//             embed.setDescription([
//                 `These are the available commands for ${message.guild.name}`,
//                 `The bot's prefix is: ${this.client.prefix}`,
//                 `Command Parameters: \`<>\` is strict & \`[]\` is optional`,
//             ]);
//             //let categories;
//             // if (!this.client.owners.includes(message.author.id)) {
//             //     categories = this.client.utils.removeDuplicates(
//             //         this.client.commands.filter((cmd) => cmd.category !== 'Owner').map((cmd) => cmd.category)
//             //     );
//             // } else {
//             //     categories = this.client.utils.removeDuplicates(this.client.commands.map((cmd) => cmd.category));
//             // }

//             // for (const category of categories) {
//             //     embed.addField(
//             //         `**${this.client.utils.capitalise(category)}**`,
//             //         this.client.commands
//             //             .filter((cmd) => cmd.category === category)
//             //             .map((cmd) => `\`${cmd.name}\``)
//             //             .join(' ')
//             //     );
//             // }
//             return message.channel.send(embed);
//         }
//     }
// }

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

    async run(message, [command]) {
        const embed = new MessageEmbed()
            .setColor('#fb94d3')
            .setAuthor(`Help Menu`, message.guild.iconURL({ dynamic: true }))
            .setThumbnail(this.client.user.displayAvatarURL())
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        if (command) {
            const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

            if (!cmd) return message.channel.send(`Invalid Command named: \`${command}\``);

            embed.setAuthor(`Command Help: ${command}`, this.client.user.displayAvatarURL());
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
                `Command Parameters: \`<>\` is strict & \`[]\` is optional`,
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
                    `**${this.category}**`,
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
