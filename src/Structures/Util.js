import path from 'path';
import { promisify } from 'util';
import g from 'glob';
import Event from './Event.js';

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

    async wait(time) {
        // sets timer in ms so the for loop in games pauses
        return new Promise((res) => setTimeout(res, time));
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
