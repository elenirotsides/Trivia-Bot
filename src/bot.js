// OOP design highly inspired by https://github.com/MenuDocs/discord.js-template

import 'dotenv/config.js';
import MDClient from './Structures/MDClient.js';

const client = new MDClient({
    token: process.env.BOT_TOKEN,
    prefix: '!',
    owners: ['Eleni Rotsides', 'Joshua Hector', 'Sylvia Boamah', 'Julio Lora'],
});

client.start();
