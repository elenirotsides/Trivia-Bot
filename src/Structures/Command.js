export default class Command {
    constructor(client, name, options = {}) {
        this.client = client;
        this.name = options.name || name;
        this.aliases = options.aliases || [];
        this.description = options.description || 'No description provided.';
        this.category = options.category || 'Miscellaneous';
        this.usage = `${this.client.prefix}${this.name} ${options.usage || ''}`.trim();
        this.strictSubCommands = options.strictSubCommands || [];
        this.optSubCommands = options.optSubCommands || [];
        // This validates the arguments by position.
        // e.g. allow numbers as the first argument
        this.allowedArguments = options.allowedArguments|| [];
    }

    async run(message, args) {
        throw new Error(`Command ${this.name} doesn't provide a run method!`);
    }

    /**
     * Returns true if there are arguments in the args param
     * that are invalid or not allowed. Sends a message in the channel about
     * the first invalid argument, if there is one.
    */
    validateArguments(message, args) {
        if (args) {
            const validArgs = args.map(
                (arg, i) => {
                    try {
                        let allowed = true;
                        // Create the value with the `type` property, a Class/constructor
                        const { type, min, max } = this.allowedArguments[i];
                        const value = type(arg);
                        // Check the different validations
                        // The validations have assumptions based on the value type
                        allowed = allowed && (max !== undefined ? value <= max : true);
                        allowed = allowed && (min !== undefined ? value >= min : true);
                        return allowed;
                    } catch {
                        return false;
                    }
                }
            );

            for(let i = 0; i < validArgs.length; i++) {
                if (!validArgs[i]) {
                    message.channel.send(`\`${this.name}\` does not allow value: \`${args[i]}\``);
                    return true;
                }
            }

        }
        return false;
    }

    /**
     * Returns true if there are commands in the command param
     * that do not exist. Sends a message in the channel about
     * the first invalid command, if there is one.
    */
    validateCommands(message, commands) {
        if (commands) {
            const validCmds = commands.map(
                cmd => {
                   return this.strictSubCommands.includes(cmd) || this.optSubCommands.includes(cmd)
                }
            );

            for(let i = 0; i < validCmds.length; i++) {
                if (!validCmds[i]) {
                    message.channel.send(`\`${this.name}\` does not have sub-command named: \`${commands[i]}\``);
                    return true;
                }
            }

        }
        return false;
    }
}
