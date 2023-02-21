// OOP design highly inspired by https://github.com/MenuDocs/discord.js-template

import 'dotenv/config.js';

import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandFiles = fs
  .readdirSync('./src/temp')
  .filter((file) => file.endsWith('.js'));
(async () => {
  const importFilesRequest = commandFiles.map(async (file) => {
    const filePath = path.join('./temp', file);
    const { default: command } = await import(`./${filePath}`);
    if ('data' in command && 'execute' in command) {
      console.log(`Set up ${filePath}`);
      client.commands.set(command.data.name, command);
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

// import MDClient from './Structures/MDClient.js';
// import { AutoPoster } from 'topgg-autoposter';

// const client = new MDClient({
//     token: process.env.BOT_TOKEN,
//     prefix: '!',
//     owners: ['Eleni Rotsides', 'Joshua Hector', 'Sylvia Boamah', 'Julio Lora'],
// });

// client.start();

// import { REST, Routes } from 'discord.js';

// const commands = [
//     {
//         name: 'ping',
//         description: 'Replies with Pong!',
//     },
//     {
//         name: 'pong',
//         description: 'Replies with ping!',
//     },
// ];

// const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

// (async () => {
//     try {
//         console.log('Started refreshing application (/) commands.');

//         await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

//         console.log('Successfully reloaded application (/) commands.');
//     } catch (error) {
//         console.error(error);
//     }
// })();

// import { Client, GatewayIntentBits } from 'discord.js';
// const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// client.on('ready', () => {
//   console.log(`Logged in as ${client.user.tag}!`);
// });

// client.on('interactionCreate', async interaction => {
//   if (!interaction.isChatInputCommand()) return;

//   if (interaction.commandName === 'ping') {
//     await interaction.reply('Pong!');
//   }
//   if (interaction.commandName === 'pong') {
//     await interaction.reply('Ping!');
//   }
// });

client.login(process.env.BOT_TOKEN);
