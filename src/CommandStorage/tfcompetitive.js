import Command from '../Structures/Command.js';
import axios from 'axios';
import { parseEntities } from 'parse-entities';
import { MessageEmbed } from 'discord.js';

export default class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ['tfcompetitive', 'tfcomp'],
            description:
                'Initiates a round of 10 question T/F trivia with random difficulties and random categories. Its `competitive` because this will only accept the first person that guesses correctly; everyone else loses by default. **TLDR; you have to be the first to answer correctly!**',
            category: 'Game Modes',
            //usage: '[time]',
        });
    }

    async run(message, commands) {
        if (!this.validateCommands(message, commands)) {
            return;
        }

        let triviaData;

        try {
            triviaData = await (await axios(`https://opentdb.com/api.php?amount=10&type=boolean`)).data.results;
        } catch (e) {
            console.log(e);
            try {
                message.channel.send({ content: 'Uh oh, something has gone wrong while trying to get some questions. Please try again' });
            } catch (e) {
                console.log(e);
                return;
            }
        }

        const embed = new MessageEmbed();
        let counter = 10;
        let stopped = false;

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

            let msgEmbed;
            try {
                msgEmbed = await message.channel.send({ embeds: [embed] });
            } catch (e) {
                console.log(e);
                return;
            }
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

            const collector = msgEmbed.createReactionCollector({ filter, max: 1, time: 10000 });

            let userWithCorrectAnswer = [];

            collector.on('collect', (r, user) => {
                // add the users that answered correctly to the usersWithCorrect Answer array
                if (r.emoji.name === '🛑') {
                    counter = 0;
                    stopped = true;
                    collector.stop();
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
            let result;

            collector.on('end', async () => {
                // if no one got any answers right
                if (userWithCorrectAnswer.length === 0) {
                    // create an embed
                    result = newEmbed
                        .setTitle("Time's Up! No one got it....")
                        .setDescription('\n The correct answer was ' + parseEntities(triviaData[i].correct_answer))
                        .setColor('#f40404');
                    // send the embed to the channel if the game wasn't terminated
                    if (!stopped) {
                        try {
                            message.channel.send({ embeds: [result] });
                        } catch (e) {
                            console.log(e);
                            return;
                        }
                    }
                } else {
                    // otherwise, create an embed with the results of the question

                    /*
                    since the array is an array of strings, I used the javascript join() method to concat them, and then the replace() to replace the
                    comma with a comma and a space, so its human readable and pleasant to the eye
                    */
                    result = newEmbed
                        .setTitle("That's IT!! Here's who got it first:")
                        .setDescription(userWithCorrectAnswer.join().replace(',', ', '))
                        .setFooter({ text: '\n The correct answer was ' + parseEntities(triviaData[i].correct_answer) })
                        .setColor('#f40404');
                    // send the embed to the channel if the game wasn't terminated
                    if (!stopped) {
                        try {
                            message.channel.send({ embeds: [result] });
                        } catch (e) {
                            console.log(e);
                            return;
                        }
                    }
                }
                if (stopped) {
                    // if the game was stopped, then we need to send the the scores to the guild

                    // iterate over the leaderboard if winners exist (if the length of the object's keys isn't 0, then we have winners)
                    if (Object.keys(leaderboard).length !== 0) {
                        // send the embed to the channel after the edit is complete
                        message.channel.send({ embeds: [result] }).then((msg) => {
                            // loop over the contents of the leaderboard, and add fields to the embed on every iteration
                            for (const key in leaderboard) {
                                result.addField(`${key}:`, `${leaderboard[key]}`.toString());
                            }

                            // to avoid exceeding the rate limit, we will be editing the result embed instead of sending a new one
                            msg.edit({ embeds: [result.setTitle('**Game Over!**\nFinal Scores:').setDescription('').setColor('#fb94d3')] });
                        });
                    } else {
                        // if the leaderboard is empty, construct a different embed

                        // send the embed to the channel after the edit is complete
                        message.channel.send({ embeds: [result] }).then((msg) => {
                            // to avoid exceeding the rate limit, we will be editing the result embed instead of sending a new one
                            msg.edit({ embeds: [result.setTitle('Game Over! No one got anything right....').setColor('#fb94d3')] });
                        });
                    }
                    // so the for loop can stop executing
                    triviaData.length = 0;
                }
            });
            if (counter === 0 || stopped) {
                break;
            }

            await this.client.utils.wait(10000);

            counter--;
        }
        if (counter === 0 && !stopped) {
            let winnerEmbed = new MessageEmbed(); // create new embed instance

            // iterate over the leaderboard if winners exist (if the length of the object's keys isn't 0, then we have winners)
            if (Object.keys(leaderboard).length !== 0) {
                // specify the contents of the embed
                let winner = winnerEmbed.setTitle('**Game Over!**\nFinal Scores:').setColor('#fb94d3');

                // loop over the contents of the leaderboard, and add fields to the embed on every iteration
                for (const key in leaderboard) {
                    winner.addField(`${key}:`, `${leaderboard[key]}`.toString());
                }
                try {
                    message.channel.send({ embeds: [winner] });
                } catch (e) {
                    console.log(e);
                    return;
                }
            } else {
                // if the leaderboard is empty, construct a different embed
                winnerEmbed.setTitle('Game Over! No one got anything right...').setColor('#fb94d3');
                // send the embed to the channel
                try {
                    message.channel.send({ embeds: [winnerEmbed] });
                } catch (e) {
                    console.log(e);
                    return;
                }
            }
        }
    }
}
