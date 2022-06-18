import { Client, Collection, Intents } from 'discord.js';
import Util from './Util.js';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import fs from 'fs';
import path from 'path';

export default class MDClient extends Client {
    constructor(options = {}) {
        super({
            disableMentions: 'everyone',
            intents: [
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            ],
            partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'],
        });
        
        this.validate(options);

        this.commands = new Collection();

        this.aliases = new Collection();

        this.events = new Collection();

        this.utils = new Util(this);

        this.commandsArray = [];
    }

    validate(options) {
        if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');

        if (!options.token) throw new Error('You must pass the token for the client.');
        this.token = options.token;

        if (!options.owners) throw new Error('You must pass a list of owners for the client.');
        if (!Array.isArray(options.owners)) throw new TypeError('Owners should be a type of Array<String>.');
        this.owners = options.owners;

        if (!options.guild) throw new Error('You must pass a test guild id.');
        this.guild = options.guild;

        if (!options.id) throw new Error('You must pass the id of the client.');
        this.id = options.id;
    }

    async loadCommands(type) {
        if (type != 'global' && type != 'local') return;

        const __dirname = path.resolve(path.dirname(''));

        const cmdDir = fs.readdirSync(path.resolve(__dirname, 'src/Commands'));

        for (const commandFile of cmdDir) {
            if (!commandFile.endsWith('.js')) return;

            import(`../commands/${commandFile}`).then((e) => {
                const cmd = e.default;

                this.commands.set(cmd.data.name, cmd);
                this.commandsArray.push(cmd.data.toJSON());
            });
        }

        const rest = new REST({
            version: '10',
        }).setToken(this.token);

        try {
            if (type === 'global') {
                await rest.put(Routes.applicationCommands(this.id), {
                    body: this.commandsArray,
                });

                console.log('OK: Registered commands globally');
            } else {
                await rest.put(Routes.applicationGuildCommands(this.id, this.guild), {
                    body: this.commandsArray,
                });

                console.log('OK: Registered commands locally');
            }
        } catch (err) {
            if (err) console.error(err);
        }
    }

    async start(token = this.token) {
        this.loadCommands('local');
        this.utils.loadEvents();
        super.login(token);
    }
}
