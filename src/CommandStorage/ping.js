import Command from '../Structures/Command.js';

export default class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ['pong'],
            description: 'This provides the ping of the bot',
            category: 'Utilities',
        });
    }

    async run(message, commands) {
        if (!this.validateCommands(message, commands)) {
            return;
        }

        let msg;
        try {
            msg = await message.channel.send({ content: 'Pinging...' });
        } catch (e) {
            console.log(e);
            return;
        }
        const latency = msg.createdTimestamp - message.createdTimestamp;

        msg.edit(`Bot Latency: \`${latency}ms\`, API Latency: \`${Math.round(this.client.ws.ping)}ms\``);
    }
}
