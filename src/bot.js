import 'dotenv/config.js';
import { Client, MessageEmbed } from 'discord.js';
import axios from 'axios';
import { parseEntities } from 'parse-entities';
import wait from 'wait';

const prefix = '-';
const bot = new Client();

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
        console.log(command);
        console.log(args);

        if (command === 'hello') {
            message.reply('hello there!');
        }

        if (command === 'play' && args[0] === 'tf' && args[1] === 'help' && args.length === 2) {
            const embed = new MessageEmbed();
            embed
                .setColor(0xffff00)
                .setTitle('T/F Modes')
                .addField(
                    '`-play tf chill`',
                    'Initiates a round of 10 question T/F trivia with random difficulties and random categories. Its `chill` because this mode allows all users to attempt to answer within the 10 second time limit.'
                )
                .addField(
                    '`-play tf competitive`',
                    'Initiates a round of 10 question T/F trivia with random difficulties and random categories. Its `competitive` because this will only accept the first person that guesses correctly; everyone else loses by default. **TLDR; you have to be the first to answer correctly!**'
                );
            message.channel.send(embed);
        }
        if (command === 'play' && args[0] === 'tf' && args[1] === 'chill' && args.length === 2) {
            message.channel.send('Lemme grab some questions for ya....');

            // creating empty trivia data object for this round of trivia
            let triviaData = {};

            let response;
            try {
                response = await (await axios(`https://opentdb.com/api.php?amount=10&type=boolean`)).data.results;
            } catch (e) {
                console.log(e);
                message.channel.send('Uh oh, something has gone wrong while trying to get some questions. Please try again');
            }

            // looping over the length of the api response, and adding entries to the object with all the data we need
            for (let i = 0; i < response.length; i++) {
                triviaData[`q${i}`] = {
                    category: parseEntities(response[i].category),
                    question: parseEntities(response[i].question),
                    difficulty: parseEntities(response[i].difficulty),
                    correctAns: parseEntities(response[i].correct_answer),
                };
            }
            const embed = new MessageEmbed();
            let counter = 10;
            let leaderboard = {};

            for (let i = 0; i < Object.keys(triviaData).length; i++) {
                embed
                    .setTitle(`Question ${i + 1}`)
                    .setColor(0xff0000)
                    .setDescription(
                        triviaData[`q${i}`].question +
                            '\n' +
                            '\n**Difficulty:** ' +
                            triviaData[`q${i}`].difficulty +
                            '\n**Category:** ' +
                            triviaData[`q${i}`].category
                    );

                let msgEmbed = await message.channel.send(embed);
                msgEmbed.react('🇹');
                msgEmbed.react('🇫');

                let answer = '';
                if (triviaData[`q${i}`].correctAns === 'True') {
                    answer = '🇹';
                } else {
                    answer = '🇫';
                }

                const filter = (reaction) => {
                    return reaction.emoji.name === answer;
                };

                const collector = msgEmbed.createReactionCollector(filter, { time: 10000 });

                let usersWithCorrectAnswer = [];
                collector.on('collect', (r, user) => {
                    if (user.username !== bot.user.username) {
                        if (r.emoji.name === answer) {
                            usersWithCorrectAnswer.push(user.username);
                            if (leaderboard[user.username] === undefined) {
                                // adding winner to leaderboard object
                                leaderboard[user.username] = 1;
                            } else {
                                // incrementing the user's score
                                leaderboard[user.username] += 1;
                            }
                        }
                    }
                });
                let newEmbed = new MessageEmbed();
                collector.on('end', async () => {
                    if (usersWithCorrectAnswer.length === 0) {
                        let result = newEmbed.setTitle("Time's Up! No one got it....").setColor([168, 124, 124]);
                        message.channel.send(result);
                    } else {
                        let result = newEmbed
                            .setTitle("Time's Up! Here's who got it right:")
                            .setDescription(usersWithCorrectAnswer.join().replace(',', ', '))
                            .setColor([168, 124, 124]);
                        message.channel.send(result);
                    }
                });
                await wait(10000);
                counter--;
            }
            if (counter === 0) {
                let winnerEmbed = new MessageEmbed();

                // iterate over the leaderboard if winners exist
                if (Object.keys(leaderboard).length !== 0) {
                    let winner = winnerEmbed.setTitle('**Game Over!**').setDescription('**Final Scores: **').setColor([168, 124, 124]);
                    for (const key in leaderboard) {
                        winner.addField(`${key}:`, `${leaderboard[key]}`);
                    }
                    message.channel.send(winner);
                } else {
                    winnerEmbed.setTitle('Game Over! No one got anything right...');
                    message.channel.send(winnerEmbed);
                }
            }
        }
        if (command === 'test') {
            const embed = new MessageEmbed();
            embed
                .setTitle('A discord embed')
                .setColor([168, 124, 124])
                .setDescription('Testing the discord embed functionality!')
                .setFooter('testing the footer');
            message.channel.send(embed);
        }

        if (command === 'help') {
            const embed = new MessageEmbed();
            embed
                .setColor(0xffff00)
                .setTitle('How to use Trivia Bot')
                .setDescription(
                    '**Useful Commands** \n`-help` Display all the commands \n`-play tf help` Gives more detail on the different modes in a T/F game \n`-play tf chill` Starts a round of chill T/F Trivia \n`-play tf competitive` Starts a round of competitive T/F Trivia \n`-stop` Terminate the Trivia Bot'
                );
            message.channel.send(embed);
        }
    }

    if (message.content === '-stop') {
        message.channel.send('Shutting Down...').then((m) => {
            // this ends the bot, causing a shut down
            // Same logic goes to the end of the game if needed
            bot.destroy().then(() => bot.login(process.env.BOT_TOKEN));
        });
    }

    if (message.content.toLocaleLowerCase().includes('trivia')) {
        //should work without the bot on???
        let responseArray = ['Did someone say my name?', 'You called?', 'Looking for me?'];
        let randomIndex = Math.floor(Math.random() * responseArray.length);
        message.channel.send(responseArray[randomIndex]);
    }
});

bot.login(process.env.BOT_TOKEN);
