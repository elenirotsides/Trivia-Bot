import path from 'path';
import { promisify } from 'util';
import g from 'glob';
import Command from './Command.js';
import Event from './Event.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const glob = promisify(g);

export default class Util {
    constructor(client) {
        this.client = client;
    }

    isClass(input) {
        return typeof input === 'function' && typeof input.prototype === 'object' && input.toString().includes('class');
    }

    get directory() {
        return `${process.cwd()}/src`;
    }

    removeDuplicates(arr) {
        return [...new Set(arr)];
    }

    async loadCommands() {
        return glob(`${this.directory}/Commands/**/*.js`).then((commands) => {
            for (const commandFile of commands) {
                delete require.cache[commandFile];
                const { name } = path.parse(commandFile);
                import(commandFile).then((c) => {
                    const File = c.default;
                    if (!this.isClass(File)) throw new TypeError(`Command ${name} doesn't export a class.`);
                    const command = new File(this.client, name.toLowerCase());
                    if (!(command instanceof Command)) throw new TypeError(`Command ${name} doesnt belong in Commands.`);
                    this.client.commands.set(command.name, command);
                    if (command.aliases.length) {
                        for (const alias of command.aliases) {
                            this.client.aliases.set(alias, command.name);
                        }
                    }
                });
            }
        });
    }

    async loadEvents() {
        return glob(`${this.directory}/Events/**/*.js`).then((events) => {
            for (const eventFile of events) {
                delete require.cache[eventFile];
                const { name } = path.parse(eventFile);
                import(eventFile).then((e) => {
                    const File = e.default;
                    if (!this.isClass(File)) throw new TypeError(`Event ${name} doesn't export a class!`);
                    const event = new File(this.client, name);
                    if (!(event instanceof Event)) throw new TypeError(`Event ${name} doesn't belong in Events`);
                    this.client.events.set(event.name, event);
                    event.emitter[event.type](name, (...args) => event.run(...args));
                });
            }
        });
    }
}
