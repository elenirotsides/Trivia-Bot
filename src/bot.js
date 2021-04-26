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

        if (command === 'play' && args[0] === 'tf' && args.length === 1) {
            // TODO: should also check that the length of args is 1
            // bot.user.setActivity('Playing Trivia');
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
                    category: parseEntities(response[i].category), // TODO show category in embed
                    question: parseEntities(response[i].question),
                    difficulty: parseEntities(response[i].difficulty),
                    correctAns: parseEntities(response[i].correct_answer),
                    // incorrectAns: parseEntities(response[i].incorrect_answers[0]),
                };
            }
            const embed = new MessageEmbed();
            let counter = 10;
            let leaderboard = {};
            // console.log(triviaData);
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
                        // will this work if more than one person clicks the same answer?
                        if (r.emoji.name === answer) {
                            usersWithCorrectAnswer.push(user.username);
                            // message.channel.send(`${r.emoji.name} added by ${user.username}`);
                            if (leaderboard[user.username] === undefined) {
                                // adding winner to leaderboard object
                                leaderboard[user.username] = 1;
                            } else {
                                leaderboard[user.username] += 1;
                            }
                        }
                    }
                });
                collector.on('end', async () => {
                    // message.channel.send("Time's up!");
                    if (usersWithCorrectAnswer.length === 0) {
                        let newEmbed = new MessageEmbed();
                        let result = newEmbed.setTitle("Time's Up! No one got it....").setColor([168, 124, 124]);
                        message.channel.send(result);
                    } else {
                        let result = embed
                            .setTitle("Time's Up! Here's who got it right:")
                            .setDescription(usersWithCorrectAnswer.join())
                            .setColor([168, 124, 124]);
                        message.channel.send(result);
                    }
                });
                //TODO: test with teamates and see if the reaction collector works
                await wait(10000);
                counter--;
            }
            if (counter === 0) {
                let winnerEmbed = new MessageEmbed();
                let result = winnerEmbed.setColor([168, 124, 124]);

                // iterate over the leaderboard if winners exist
                if (Object.keys(leaderboard).length > 0) {
                    result.setDescription('**Here are the winners:**');
                    for (let i = 0; i < Object.keys(leaderboard).length; i++) {
                        result.addField(`${Object.keys(i)}: ${leaderboard[i]}`);
                    }
                } else {
                    result.setTitle('Game Over! No one got anything right...');
                }

                message.channel.send(result);
            }

            // collector.on('end', (collected) => {
            //     // the users that got it right are.....
            //     message.channel.send('Round over!');
            // });
            // msgEmbed
            //     .awaitReactions(filter, { time: 5000 })
            //     .then((collected) => message.channel.send(`I collected ${collected.size} 🇹`))
            //     .catch(message.channel.send('Something has gone wrong'));
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
                .setTitle('How to use the TriviaBot')
                .setDescription(
                    'Useful Commands \n-help: Display all the commands \n-play: Initialize the TriviaBot \n-stop: Terminate the Trivia Bot'
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

    // if (message.content === 'anything') {
    //     //anything works without -play **bug**
    //     message.channel.send('Okay....grabbing some questions');
    //     try {
    //         let response = await axios(`https://opentdb.com/api.php?amount=${10}`);
    //         let question = response.data.results[0].question;
    //         let parsedQuestion = parseEntities(question);
    //         // console.log(response);
    //         // console.log(question);
    //         const embed = new MessageEmbed();
    //         embed.setTitle('Question 1').setColor(0xff0000).setDescription(parsedQuestion);
    //         message.channel.send(embed);
    //     } catch (e) {
    //         console.log(e);
    //         message.channel.send('Uh oh, something has gone wrong, please try again');
    //     }
    // }

    if (message.content.toLocaleLowerCase().includes('trivia')) {
        //should work without the bot on???
        let responseArray = ['Did someone say my name?', 'You called?', 'Looking for me?'];
        let randomIndex = Math.floor(Math.random() * responseArray.length);
        message.channel.send(responseArray[randomIndex]);
    }
});

bot.login(process.env.BOT_TOKEN);
