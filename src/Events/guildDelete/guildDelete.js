import Event from '../../Structures/Event.js';

export default class extends Event {
    run() {
        console.log(`Removed from a server! Now in ${this.client.guilds.cache.size} servers.`);
    }
}
