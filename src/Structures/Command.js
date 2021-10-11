export default class Command {
    constructor(client, name, options = {}) {
        this.client = client;
        this.name = options.name || name;
        this.aliases = options.aliases || [];
        this.description = options.description || 'No description provided.';
        this.category = options.category || 'Miscellaneous';
        this.usage = `${this.client.prefix}${this.name} ${options.usage || ''}`.trim();
    }

    async run(message, args) {
        throw new Error(`Command ${this.name} doesn't provide a run method!`);
    }

    /**
     * Returns true if there are commands in the command param
     * that need to be denied. Sends a message in the channel about
     * the invalid command.
    */
    denyCommands(message, [command]) {
        if (command) {
            const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

            if (!cmd) message.channel.send(`Invalid Command named: \`${command}\``);
            return true;
        }
        return false;
    }
}
