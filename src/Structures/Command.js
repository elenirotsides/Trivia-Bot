/**
 * This is used as a dictionary in which the key is the command
 * and the value is the configuration of the arguments accepted
 * by the command.
 *
 * They key and the `cmd` must match
 */
const optSubCommandsDefinitions = {
    time: {
        cmd: 'time',
        type: Number,
        default: 10,
        min: 10,
        max: 180,
    }
};

export default class Command {
    constructor(client, name, options = {}) {
        this.client = client;
        this.name = options.name || name;
        this.aliases = options.aliases || [];
        this.description = options.description || 'No description provided.';
        this.category = options.category || 'Miscellaneous';
        this.usage = `${this.client.prefix}${this.name} ${options.usage || ''}`.trim();
        this.strictSubCommands = options.strictSubCommands || [];
        // This validates the arguments by position.
        // e.g. allow numbers as the first argument
        this.optSubCommands = options.optSubCommands || [];
    }

    async run(message, args) {
        throw new Error(`Command ${this.name} doesn't provide a run method!`);
    }

    /**
     * Casts the value based on the `validations.type` property
     * and checks all the validations against the value.
     *
     * Returns an object with the validity and casted value of the arguments
    */
    validateArgument(arg, validations) {
        try {
            let allowed = true;
            // Create the value with the `type` property, a Class/constructor
            const { type, min, max } = validations;
            const value = type(arg);
            // Check the different validations
            // The validations have assumptions based on the value type
            // e.g. `max` and `min` will only be present when the `type` is `Number`
            allowed = allowed && (max !== undefined ? value <= max : true);
            allowed = allowed && (min !== undefined ? value >= min : true);
            return {
                isValid: allowed,
                value
            };
        } catch {
            // If there's any error during the conversion, take it as invalid
            return {
                isValid: false,
                value: null
            };
        }
    }

    /**
     * Returns `false` if there are commands in the command param
     * that do not exist. Sends a message in the channel about
     * the first invalid command, if there is one.
     * Returns the casted values if applicable
     * `commands` is an array of the passed options followed by the desired value.
     * e.g. ['time', '15', 'questions', '5']
    */
    validateCommands(message, commands) {
        if (commands) {
            const parsedCmds = {};
            const subCmds = [];
            // Parse the commands, consuming the arguments if necessary
            for (let i = 0; i < commands.length; i++) {
                let consumeInput = false;
                let cmd = commands[i];
                let cmdDef = optSubCommandsDefinitions[cmd];
                // Unknown command, stop checking the input
                if (!cmdDef) {
                    // Add the command so the next step shows the error to the user
                    subCmds.push(cmd);
                    break;
                }
                // Add the sub command to the list to check if it's valid
                subCmds.push(cmd);
                // If a command has a `type` property it consumes the next input
                if (cmdDef.type) {
                    consumeInput = true;

                }
                // Check if an expected argument is missing
                if (consumeInput && i + 1 >= commands.length) {
                    break;
                }
                // Update the counter if necessary to send the argument to the validator
                i = consumeInput ? i + 1 : i;
                // Run the validations for the arguments
                parsedCmds[cmd] = this.validateArgument(commands[i], cmdDef);
            }


            const validCmds = subCmds.map(
                (cmd, i) => {
                    return this.strictSubCommands.includes(cmd) || this.optSubCommands.includes(cmd)
                }
            );

            for(let i = 0; i < validCmds.length; i++) {
                // Check for subcommands
                if (!validCmds[i]) {
                    message.channel.send(`\`${this.name}\` does not have sub-command named: \`${subCmds[i]}\``);
                    return false;
                }
                // Check for arguments
                if (parsedCmds[subCmds[i]] && !parsedCmds[subCmds[i]].isValid) {
                    message.channel.send(`\`${this.name}\` option: \`${subCmds[i]}\` has an unexpected value \`${parsedCmds[subCmds[i]].value}\``);
                    return false;
                }
            }

            // At this point everything is validated. Flatten the commands
            return Object.keys(parsedCmds).reduce((acc, subCmds) => {
                acc[subCmds] = parsedCmds[subCmds].value;
                return acc;
            }, {});
        }

        return true;
    }
}
