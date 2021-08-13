import Command from '../Structures/Command.js';
import axios from 'axios';
import { parseEntities } from 'parse-entities';
import { MessageEmbed } from 'discord.js';

export default class extends Command {
    constructor(...args) {
        super(...args, {
            description:
                'Initiates a round of 10 question T/F trivia with random difficulties and random categories. Its `competitive` because this will only accept the first person that guesses correctly; everyone else loses by default. **TLDR; you have to be the first to answer correctly!**',
            category: 'Game Modes',
            //usage: '[time]',
        });
    }

    async run(message) {
        // setting the bot's activity
        this.client.user.setActivity('tfcompetitive', { type: 'PLAYING' });

        let triviaData;

        try {
            triviaData = await (await axios(`https://opentdb.com/api.php?amount=10&type=boolean`)).data.results;
        } catch (e) {
            console.log(e);
            message.channel.send('Uh oh, something has gone wrong while trying to get some questions. Please try again');
        }

        const embed = new MessageEmbed();
        let counter = 10;
        let leaderboard = {};

        for (let i = 0; i < triviaData.length; i++) {
            embed
                .setTitle(`Question ${i + 1}`)
                .setColor('#5fdbe3')
                .setDescription(
                    parseEntities(triviaData[i].question) +
                        '\n' +
                        '\n**Difficulty:** ' +
                        parseEntities(triviaData[i].difficulty) +
                        '\n**Category:** ' +
                        parseEntities(triviaData[i].category)
                );

            let msgEmbed = await message.channel.send(embed);
            msgEmbed.react('🇹');
            msgEmbed.react('🇫');
            msgEmbed.react('🛑'); // adds a universal stop sign

            let answer = '';
            if (triviaData[i].correct_answer === 'True') {
                answer = '🇹';
            } else {
                answer = '🇫';
            }

            const filter = (reaction, user) => {
                return (reaction.emoji.name === answer || reaction.emoji.name === '🛑') && user.username !== this.client.user.username;
            };

            const collector = msgEmbed.createReactionCollector(filter, { max: 1, time: 10000 });

            let userWithCorrectAnswer = [];

            collector.on('collect', (r, user) => {
                //message.channel.send(user.username)
                // add the users that answered correctly to the usersWithCorrect Answer array
                if (r.emoji.name === '🛑') {
                    counter = 0;
                } else {
                    userWithCorrectAnswer.push(user.username);
                    if (leaderboard[user.username] === undefined) {
                        // if the user isn't already in the leaderboard object, add them and give them a score of 1
                        leaderboard[user.username] = 1;
                    } else {
                        // otherwise, increment the user's score
                        leaderboard[user.username] += 1;
                    }
                }
            });
            let newEmbed = new MessageEmbed();

            collector.on('end', async () => {
                // if no one got any answers right
                if (userWithCorrectAnswer.length === 0) {
                    // create an embed
                    let result = newEmbed.setTitle("Time's Up! No one got it....").setColor('#f40404');
                    // send the embed to the channel
                    message.channel.send(result);
                } else {
                    // otherwise, create an embed with the results of the question
                    /* since the array is an array of strings, I used the javascript join() method to concat them, and then the replace() to replace the 
                        comma with a comma and a space, so its human readable and pleasant to the eye
                        */
                    let result = newEmbed
                        .setTitle("Time's Up! Here's who got it right:")
                        .setDescription(userWithCorrectAnswer.join().replace(',', ', '))
                        .setTitle("That's IT! Here's who got it first:")
                        .setDescription(userWithCorrectAnswer.join().replace(',', ', '))
                        .setColor('#f40404');
                    // send the embed to the channel
                    message.channel.send(result);
                }
            });
            await this.client.utils.wait(10000);
            if (counter === 0) {
                break;
            }
            counter--;
        }
        if (counter === 0) {
            let winnerEmbed = new MessageEmbed(); // create new embed instance

            // iterate over the leaderboard if winners exist (if the length of the object's keys isn't 0, then we have winners)
            if (Object.keys(leaderboard).length !== 0) {
                // specify the contents of the embed
                let winner = winnerEmbed.setTitle('**Game Over!**').setDescription('**Final Scores: **').setColor('#5fdbe3');

                // loop over the contents of the leaderboard, and add fields to the embed on every iteration
                for (const key in leaderboard) {
                    winner.addField(`${key}:`, `${leaderboard[key]}`);
                }
                message.channel.send(winner);
            } else {
                // if the leaderboard is empty, construct a different embed
                winnerEmbed.setTitle('Game Over! No one got anything right...').setColor('#5fdbe3');
                // send the embed to the channel
                message.channel.send(winnerEmbed);
            }
        }

        this.client.user.setActivity('', { type: '' });
    }
}
