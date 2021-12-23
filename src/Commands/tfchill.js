import Command from '../Structures/Command.js';
import axios from 'axios';
import { parseEntities } from 'parse-entities';
import { MessageEmbed } from 'discord.js';

export default class extends Command {
    constructor(...args) {
        super(...args, {
            description:
                'Initiates a round of 10 question T/F trivia with random difficulties and random categories. Its `chill` because this mode allows all users to attempt to answer within the 10 second time limit.',
            category: 'Game Modes',
            usage: 'time [seconds (10 to 180)]',
            optSubCommands: ['time'],
        });
    }

    async run(message, commands) {
        const parsedCommands = this.validateCommands(message, commands);
        if (!parsedCommands) {
            return;
        }
        let time = parsedCommands.time;
        if (isNaN(time)) {
            time = 10000; // 10 seconds default
        } else {
            time = time * 1000;
        }
        // setting the bot's activity
        this.client.user.setActivity('tfchill', { type: 'PLAYING' });

        // sends a cute lil message to the channel letting the users know that a game will begin
        message.channel.send(`Lemme grab some questions for ya....\nYou have ${time / 1000} seconds to answer each question`);

        /* creating empty trivia data variable for this round of trivia
            It will be filled with data that was queried from the api, like so:
            (the api sends it as an array of objects)

            [
                {
                    "category": "Entertainment: Film",
                    "type": "boolean",
                    "difficulty": "easy",
                    "question": "Han Solo&#039;s co-pilot and best friend, &quot;Chewbacca&quot;, is an Ewok.",
                    "correct_answer": "False",
                    "incorrect_answers": ["True"]
                },
                {
                    ....so on and so forth....
                }
            ]

            Notice the data that the api sends back has more data than what we need; that's okay, we just won't use it
            */
        let triviaData; // will hold the response that the api gave after a successful request

        try {
            // the api call is wrapped in a try/catch because it can fail, and we don't want our program to crash
            triviaData = await (await axios(`https://opentdb.com/api.php?amount=10&type=boolean`)).data.results;
        } catch (e) {
            // if the api call does fail, we log the result and then send a cute lil error to the channel
            console.log(e);
            message.channel.send('Uh oh, something has gone wrong while trying to get some questions. Please try again');
        }

        const embed = new MessageEmbed(); // creates new embed instance
        let counter = 10; // a counter that will help us execute the other channel messages later (helps us keep track of loop iterations)
        let stopped = false; // will help control the behaivor of the embeds and game termination since behavior of the message collector is limited

        /* instantiate empty leaderboard object where we'll store leaderboard stats
            Takes the form:
            {
            elmo: 4,
            bobthebuilder: 7,
            ....and so on and so forth....
            }
            */
        let leaderboard = {};

        /* and now the fun begins.....
            Loops over the contents of triviaData, and sends the question in an embed after the completion of the embed construction
            */
        for (let i = 0; i < triviaData.length; i++) {
            embed
                .setTitle(`Question ${i + 1}`) // Title dynamically updates depending on which iteration we're on
                .setColor('#5fdbe3') // color of the embed
                .setDescription(
                    // the meat and potatoes of the embed
                    parseEntities(triviaData[i].question) + // the question
                        '\n' + // added a space
                        '\n**Difficulty:** ' + // putting double ** bolds the text, and single * italicizes it (in the Discord application)
                        parseEntities(triviaData[i].difficulty) + // difficulty
                        '\n**Category:** ' +
                        parseEntities(triviaData[i].category) // category
                );

            let msgEmbed = await message.channel.send(embed); // sends the embed
            msgEmbed.react('🇹'); // adds a universal T emoji
            msgEmbed.react('🇫'); // adds a universal F emoji
            msgEmbed.react('🛑'); // adds a universal stop sign

            let answer = ''; // instantiate empty answer string, where correctAns will be housed
            if (triviaData[i].correct_answer === 'True') {
                // if the correct answer is True, answer is equal to the T emoji
                answer = '🇹';
            } else {
                // otherwise its equal to the F emoji
                answer = '🇫';
            }

            // the createReactionCollector takes in a filter function, so we need to create the basis for what that filter is here
            const filter = (reaction, user) => {
                // filters only the reactions that are equal to the answer
                return (reaction.emoji.name === answer || reaction.emoji.name === '🛑') && user.username !== this.client.user.username;
            };

            // adds createReactionCollector to the embed we sent, so we can 'collect' all the correct answers
            const collector = msgEmbed.createReactionCollector(filter, { time }); // will only collect for n seconds

            // an array that will hold all the users that answered correctly
            let usersWithCorrectAnswer = [];

            // starts collecting
            // r is reaction and user is user
            collector.on('collect', (r, user) => {
                // if the user is not the bot, and the reaction given is equal to the answer
                // add the users that answered correctly to the usersWithCorrect Answer array
                if (r.emoji.name === '🛑') {
                    counter = 0;
                    stopped = true;
                    collector.stop();
                } else {
                    usersWithCorrectAnswer.push(user.username);
                    if (leaderboard[user.username] === undefined) {
                        // if the user isn't already in the leaderboard object, add them and give them a score of 1
                        leaderboard[user.username] = 1;
                    } else {
                        // otherwise, increment the user's score
                        leaderboard[user.username] += 1;
                    }
                }
            });
            let newEmbed = new MessageEmbed(); // new embed instance
            let result;

            // what will be executed when the collector completes
            collector.on('end', () => {
                // if no one got any answers right
                if (usersWithCorrectAnswer.length === 0) {
                    // create an embed
                    result = newEmbed
                        .setTitle("Time's Up! No one got it....")
                        .setFooter('\n The correct answer was ' + parseEntities(triviaData[i].correct_answer))
                        .setColor('#f40404');
                    // send the embed to the channel if the game wasn't terminated
                    if (!stopped) {
                        message.channel.send(result);
                    }
                } else {
                    // otherwise, create an embed with the results of the question

                    /* 
                    since the array is an array of strings, I used the javascript join() method to concat them, and then the replace() to replace the
                    comma with a comma and a space, so its human readable and pleasant to the eye
                    */
                    result = newEmbed
                        .setTitle("Time's Up! Here's who got it right:")
                        .setDescription(usersWithCorrectAnswer.join().replace(',', ', '))
                        .setFooter('\n The correct answer was ' + parseEntities(triviaData[i].correct_answer))
                        .setColor('#f40404');
                    // send the embed to the channel if the game wasn't terminated
                    if (!stopped) {
                        message.channel.send(result);
                    }
                }
                if (stopped) {
                    // if the game was stopped, then we need to send the the scores to the guild

                    // iterate over the leaderboard if winners exist (if the length of the object's keys isn't 0, then we have winners)
                    if (Object.keys(leaderboard).length !== 0) {
                        // send the embed to the channel after the edit is complete
                        message.channel.send({ embed: result }).then((msg) => {
                            // loop over the contents of the leaderboard, and add fields to the embed on every iteration
                            for (const key in leaderboard) {
                                result.addField(`${key}:`, `${leaderboard[key]}`);
                            }

                            // to avoid exceeding the rate limit, we will be editing the result embed instead of sending a new one
                            msg.edit(result.setTitle('**Game Over!**\nFinal Scores:').setDescription('').setColor('#fb94d3'));
                        });
                    } else {
                        // if the leaderboard is empty, construct a different embed

                        // send the embed to the channel after the edit is complete
                        message.channel.send({ embed: result }).then((msg) => {
                            // to avoid exceeding the rate limit, we will be editing the result embed instead of sending a new one
                            msg.edit(result.setTitle('Game Over! No one got anything right....').setColor('#fb94d3'));
                        });
                    }
                    // so the for loop can stop executing
                    triviaData.length = 0;
                }
            });
            if (counter === 0 || stopped) {
                break;
            }
            /* if I don't include a pause of some sort, then the for loop will RAPID FIRE send all the questions to the channel
                adding a pause here that is equal to the collection time allows for time in between questions, and an
                overall pleasant user experience
                */
            await this.client.utils.wait(time);

            // decrement the counter, tbh I don't know if having a counter is necessary now that I'm looking at this....we can fix this later
            counter--;
        }
        if (counter === 0 && !stopped) {
            // if the game wasn't triggered to stop before the questions ran out, then here is where the results will be sent to the guild

            let winnerEmbed = new MessageEmbed(); // create new embed instance

            // iterate over the leaderboard if winners exist (if the length of the object's keys isn't 0, then we have winners)
            if (Object.keys(leaderboard).length !== 0) {
                // specify the contents of the embed
                let winner = winnerEmbed.setTitle('**Game Over!**\nFinal Scores:').setColor('#fb94d3');

                // loop over the contents of the leaderboard, and add fields to the embed on every iteration
                for (const key in leaderboard) {
                    winner.addField(`${key}:`, `${leaderboard[key]}`);
                }
                message.channel.send(winner);
            } else {
                // if the leaderboard is empty, construct a different embed
                winnerEmbed.setTitle('Game Over! No one got anything right...').setColor('#fb94d3');
                // send the embed to the channel
                message.channel.send(winnerEmbed);
            }
        }
        this.client.user.setActivity('', { type: '' });
    }
}
