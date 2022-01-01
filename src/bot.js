// OOP design highly inspired by https://github.com/MenuDocs/discord.js-template

import 'dotenv/config.js';
import MDClient from './Structures/MDClient.js';
import { AutoPoster } from 'topgg-autoposter';

const client = new MDClient({
    token: process.env.BOT_TOKEN,
    prefix: '!',
    owners: ['Eleni Rotsides', 'Joshua Hector', 'Sylvia Boamah', 'Julio Lora'],
});

client.start();

// only send stats to Top.gg every 12 hours
setInterval(() => {
    const poster = AutoPoster(process.env.TOP_GG_TOKEN, client);
    poster.on('posted', (stats) => {
        console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`);
    });

    poster.on('error', (e) => {
        console.log('Something has gone wrong while trying to send stats to Top.gg');
    });
}, 43200000);
