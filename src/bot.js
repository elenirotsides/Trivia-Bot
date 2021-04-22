import 'dotenv/config.js';
import { Client, MessageEmbed } from 'discord.js';
import axios from 'axios';
import { parseEntities } from 'parse-entities';

const prefix = '-';
const bot = new Client();
const embed = new MessageEmbed();

bot.on('ready', () => {
    console.log(`${bot.user.tag} has logged in.`);
});

bot.on('message', async (message) => {
    if (message.author.bot) return; //ensures that the bot doesn't read its own messages which can cause an infinite loop
    // console.log(`[${message.author.tag}]: ${message.content}`);

    if (message.content.startsWith(prefix)) {
        /* array destructuring
        CMD_NAME is a variable and the first word in the command
        Every word after is an argument which is stored in an array called args 
        ... is a spreader operator, aka it unpacks all the elements from the array into the args variable */

        //        trims leading and trailing whitespace    turns to prfix to string         splits by spaces in between words
        const [command, ...args] = message.content.trim().substring(prefix.length).split(/\s+/); // "hello"
        // console.log(command);
        // console.log(args);

        // if (command === 'hello') {
        //     // message.reply('hello there!');
        //     message.channel.send('hello');
        // }

        if (command === 'play') {
            message.channel.send('What category would you like to play?');
        }
        if (command === 'test') {
            embed
                .setTitle('A discord embed')
                .setColor([168, 124, 124])
                .setDescription('Testing the discord embed functionality!')
                .setFooter('testing the footer');
            message.channel.send(embed);
        }
    }
    if (message.content === 'anything') {
        message.channel.send('Okay....grabbing some questions');
        try {
            let response = await axios(`https://opentdb.com/api.php?amount=${10}`);
            let question = response.data.results[0].question;
            let parsedQuestion = parseEntities(question);
            // console.log(response);
            // console.log(question);
            embed.setTitle('Question 1').setColor(0xff0000).setDescription(parsedQuestion);
            message.channel.send(embed);
        } catch (e) {
            console.log(e);
            message.channel.send('Uh oh, something has gone wrong, please try again');
        }
    }
});
bot.login(process.env.BOT_TOKEN);
