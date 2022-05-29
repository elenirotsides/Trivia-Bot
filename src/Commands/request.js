import Command from '../Structures/Command.js';

export default class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ['request', 'rewuest', 'bug'],
            description: 'Gives users link to open requests and bug reports',
            category: 'Utilities',
        });
    }

    async run(message, commands) {
        if (!this.validateCommands(message, commands)) {
            return;
        }
        message.channel.send({
            content: 'Please open an issue for any feature requests or bug reports here: https://github.com/elenirotsides/Trivia-Bot/issues',
        });
    }
}
