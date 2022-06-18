import Event from '../../Structures/Event.js';

export default class extends Event {
    async run(interaction) {
        const client = interaction.client;

        // Commands
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                command.execute();
            } catch (err) {
                console.log(`ERROR: ${err}`);
                interaction.reply({
                    content: 'An unexspected error occured. Sorry :(',
                    ephemeral: true,
                });
            }
        }
    }
}
