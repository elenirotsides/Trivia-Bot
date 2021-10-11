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
     * that do not exist. Sends a message in the channel about
     * the first invalid command, if there is one.
    */
    validateCommands(message, commands) {
        if (commands) {
            const cmds = commands.map(
                cmd => {
                    return this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd))
                }
            );

            for(let i = 0; i < cmds.length; i++) {
                if (!cmds[i]) message.channel.send(`\`${this.name}\` does not have sub-command named: \`${commands[i]}\``);
                return true;
            }

        }
        return false;
    }
}
