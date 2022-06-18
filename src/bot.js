// OOP design highly inspired by https://github.com/MenuDocs/discord.js-template
import 'dotenv/config.js';
import MDClient from './Structures/MDClient.js';
import { AutoPoster } from 'topgg-autoposter';

// Create a new client
const client = new MDClient({
    token: process.env.BOT_TOKEN,
    owners: ['Eleni Rotsides', 'Joshua Hector', 'Sylvia Boamah', 'Julio Lora'],
    guild: process.env.GUILD_ID,
    id: process.env.CLIENT_ID
});

client.start();

// const poster = AutoPoster(process.env.TOP_GG_TOKEN, client);

// poster.on('posted', (stats) => {
//     console.log(`OK: Posted stats to Top.gg | ${stats.serverCount} servers`);
// });

// poster.on('error', (e) => {
//     console.log('ERROR: Something has gone wrong while trying to send stats to Top.gg');
// });
