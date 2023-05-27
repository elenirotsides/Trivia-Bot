import 'dotenv/config.js';

import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandList = [];

const commandFiles = fs.readdirSync('./src/Commands').filter((file) => file.endsWith('.js'));
(async () => {
    const importFilesRequest = commandFiles.map(async (file) => {
        const filePath = path.join('./Commands', file);
        const { default: command } = await import(`./${filePath}`);
        if ('data' in command && 'execute' in command) {
            console.log(`Set up ${filePath}`);
            client.commands.set(command.data.name, command);
            commandList.push(command.data);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    });
    console.log('See this before other logs');
    await Promise.all(importFilesRequest);

    console.log('Bot is ready');
})();
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        });
    }
});

client.login(process.env.BOT_TOKEN);
export default commandList;
