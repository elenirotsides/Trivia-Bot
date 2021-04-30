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

        if (command === 'play' && args[0] === 'tf' && args[1] === 'help' && args.length === 2) {
            // command must be -play tf help, so that's what this conditional is looking for in order to successfully execute
            const embed = new MessageEmbed(); // creates new embed instance

            // setting the fields for the embed
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
            // sends the embed to the channel
            message.channel.send(embed);
        }

        // MC CHILL GAME
        if (command === 'play' && args[0] === 'mc' && args[1] === 'chill' && args.length === 2) {
            // command must be -play mc chill, so that's what this conditional is looking for in order to successfully execute

            // sends a cute lil message to the channel letting the users know that a game will begin
            message.channel.send('Lemme grab some questions for ya....');

            /* creating empty trivia data object for this round of trivia
            It will be filled with data once the for loop on line 83 completes, it'll hold all the questions and the 
            data needed that was queried from the api, like so:

            {
            q1: {
                    category: "Science",
                    question: "Mars is the closest planet to the Sun.",
                    difficulty: "easy",
                    correctAns: "False"
                  },
            q2: {
                    ....so on and so forth....
                  }
            }
            */
            let triviaData = {};

            let response; // will hold the response that the api gave after a successful request
            try {
                // the api call is wrapped in a try/catch because it can fail, and we don't want our program to crash
                response = await axios(`https://opentdb.com/api.php?amount=10&type=multiple`).data;
                console.log(response);
            } catch (e) {
                // if the api call does fail, we log the result and then send a cute lil error to the channel
                console.log(e);
                message.channel.send('Uh oh, something has gone wrong while trying to get some questions. Please try again');
            }

            // looping over the length of the api response, and adding entries to the triviaData object with all the data we need in a structure that works for us
            for (let i = 0; i < response.length; i++) {
                triviaData[`q${i}`] = {
                    category: parseEntities(response[i].category),
                    question: parseEntities(response[i].question),
                    difficulty: parseEntities(response[i].difficulty),
                    correctAns: parseEntities(response[i].correct_answer),
                    incorrectAns : parseEntities(response[i].incorrect_answers[i]),
                };
            }
            const embed = new MessageEmbed(); // creates new embed instance
            let counter = 10; // a counter that will help us execute the other channel messages later (helps us keep track of loop iterations)
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
            for (let i = 0; i < Object.keys(triviaData).length; i++) {
                embed
                    .setTitle(`Question ${i + 1}`) // Title dynamically updates depending on which iteration we're on
                    .setColor(0xff0000) // color of the embed for multiple choice
                    .setDescription(
                        // the meat and potatoes of the embed
                        triviaData[`q${i}`].question + // the question
                            '\n' + // added a space
                            '\n**Difficulty:** ' + // putting double ** bolds the text, and single * italicizes it (in the Discord application)
                            triviaData[`q${i}`].difficulty + // difficulty
                            '\n**Category:** ' +
                            triviaData[`q${i}`].category // category
                    );

                let msgEmbed = await message.channel.send(embed); // sends the embed
                let choices = [correctAns, incorrectAns[0], incorrectAns[1], incorrectAns[2]];

                msgEmbed.react('🇦'); // adds a universal A emoji
                msgEmbed.react('🇧'); // adds a universal B emoji
                msgEmbed.react('🇨'); // adds a universal C emoji
                msgEmbed.react('🇩'); // adds a universal D emoji

                function shuffle(array) {
                    var currentIndex = array.length;
                  
                    // While there remain elements to shuffle...
                    while (0 !== currentIndex) {
                  
                      // Pick a remaining element...
                      randomIndex = Math.floor(Math.random() * currentIndex);
                      currentIndex -= 1;
                  
                      // And swap it with the current element.
                      temporaryValue = array[currentIndex];
                      array[currentIndex] = array[randomIndex];
                      array[randomIndex] = temporaryValue;
                    }
                  
                    return array;
                  }
                
                  shuffle(choices);
                  
                

                let answer = ''; // instantiate empty answer string, where correctAns will be housed
                if (choices[0] === triviaData[`q${i}`].correctAns) {
                    // if the correct answer is in index 0, answer is equal to the A emoji
                    answer = '🇦';
                } if (choices[1] === triviaData[`q${i}`].correctAns) {
                    // if the correct answer is in index 1, answer is equal to the B emoji
                    answer = '🇧';
                }
                if (choices[2] === triviaData[`q${i}`].correctAns) {
                    // if the correct answer is in index 2, answer is equal to the C emoji
                    answer = '🇨';
                }
                else {
                    // otherwise its equal to the D emoji
                    answer = '🇩';
                }

                // the createReactionCollector takes in a filter function, so we need to create the basis for what that filter is here
                const filter = (reaction) => {
                    // filters only the reactions that are equal to the answer
                    return reaction.emoji.name === answer;
                };

                // adds createReactionCollector to the embed we sent, so we can 'collect' all the correct answers
                const collector = msgEmbed.createReactionCollector(filter, { time: 10000 }); // will only collect for 10 seconds

                // an array that will hold all the users that answered correctly
                let usersWithCorrectAnswer = [];

                // starts collecting
                // r is reaction and user is user
                collector.on('collect', (r, user) => {
                    // if the user is not the bot, and the reaction given is equal to the answer
                    if (user.username !== bot.user.username && r.emoji.name === answer) {
                        // add the users that answered correctly to the usersWithCorrect Answer array
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

                // what will be executed when the collector completes
                collector.on('end', async () => {
                    // if no one got any answers right
                    if (usersWithCorrectAnswer.length === 0) {
                        // create an embed
                        let result = newEmbed.setTitle("Time's Up! No one got it....").setColor([168, 124, 124]);
                        // send the embed to the channel
                        message.channel.send(result);
                    } else {
                        // otherwise, create an embed with the results of the question
                        /* since the array is an array of strings, I used the javascript join() method to concat them, and then the replace() to replace the 
                        comma with a comma and a space, so its human readable and pleasant to the eye
                        */
                        let result = newEmbed
                            .setTitle("Time's Up! Here's who got it right:")
                            .setDescription(usersWithCorrectAnswer.join().replace(',', ', '))
                            .setColor([168, 124, 124]);
                        // send the embed to the channel
                        message.channel.send(result);
                    }
                });
                /* if I don't include a pause of some sort, then the for loop will RAPID FIRE send all the questions to the channel
                adding a pause here that is equal to the collection time (10 seconds) allows for time in between questions, and an 
                overall pleasant user experience
                */
                await wait(10000);
                // decrement the counter, tbh I don't know if having a counter is necessary now that I'm looking at this....we can fix this later
                counter--;
            }
            if (counter === 0) {
                let winnerEmbed = new MessageEmbed(); // create new embed instance

                // iterate over the leaderboard if winners exist (if the length of the object's keys isn't 0, then we have winners)
                if (Object.keys(leaderboard).length !== 0) {
                    // specify the contents of the embed
                    let winner = winnerEmbed.setTitle('**Game Over!**').setDescription('**Final Scores: **').setColor([168, 124, 124]);

                    // loop over the contents of the leaderboard, and add fields to the embed on every iteration
                    for (const key in leaderboard) {
                        winner.addField(`${key}:`, `${leaderboard[key]}`);
                    }
                    message.channel.send(winner);
                } else {
                    // if the leaderboard is empty, construct a different embed
                    winnerEmbed.setTitle('Game Over! No one got anything right...');
                    // send the embed to the channel
                    message.channel.send(winnerEmbed);
                }
            }
        }

        //TF CHILL GAME

        if (command === 'play' && args[0] === 'tf' && args[1] === 'chill' && args.length === 2) {
            // command must be -play tf chill, so that's what this conditional is looking for in order to successfully execute

            // sends a cute lil message to the channel letting the users know that a game will begin
            message.channel.send('Lemme grab some questions for ya....');

            /* creating empty trivia data object for this round of trivia
            It will be filled with data once the for loop on line 83 completes, it'll hold all the questions and the 
            data needed that was queried from the api, like so:

            {
            q1: {
                    category: "Science",
                    question: "Mars is the closest planet to the Sun.",
                    difficulty: "easy",
                    correctAns: "False"
                  },
            q2: {
                    ....so on and so forth....
                  }
            }
            */
            let triviaData = {};

            let response; // will hold the response that the api gave after a successful request
            try {
                // the api call is wrapped in a try/catch because it can fail, and we don't want our program to crash
                response = await (await axios(`https://opentdb.com/api.php?amount=10&type=boolean`)).data.results;
            } catch (e) {
                // if the api call does fail, we log the result and then send a cute lil error to the channel
                console.log(e);
                message.channel.send('Uh oh, something has gone wrong while trying to get some questions. Please try again');
            }

            // looping over the length of the api response, and adding entries to the triviaData object with all the data we need in a structure that works for us
            for (let i = 0; i < response.length; i++) {
                triviaData[`q${i}`] = {
                    category: parseEntities(response[i].category),
                    question: parseEntities(response[i].question),
                    difficulty: parseEntities(response[i].difficulty),
                    correctAns: parseEntities(response[i].correct_answer),
                };
            }
            const embed = new MessageEmbed(); // creates new embed instance
            let counter = 10; // a counter that will help us execute the other channel messages later (helps us keep track of loop iterations)
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
            for (let i = 0; i < Object.keys(triviaData).length; i++) {
                embed
                    .setTitle(`Question ${i + 1}`) // Title dynamically updates depending on which iteration we're on
                    .setColor(0xff0000) // color of the embed
                    .setDescription(
                        // the meat and potatoes of the embed
                        triviaData[`q${i}`].question + // the question
                            '\n' + // added a space
                            '\n**Difficulty:** ' + // putting double ** bolds the text, and single * italicizes it (in the Discord application)
                            triviaData[`q${i}`].difficulty + // difficulty
                            '\n**Category:** ' +
                            triviaData[`q${i}`].category // category
                    );

                let msgEmbed = await message.channel.send(embed); // sends the embed
                msgEmbed.react('🇹'); // adds a universal T emoji
                msgEmbed.react('🇫'); // adds a universal F emoji

                let answer = ''; // instantiate empty answer string, where correctAns will be housed
                if (triviaData[`q${i}`].correctAns === 'True') {
                    // if the correct answer is True, answer is equal to the T emoji
                    answer = '🇹';
                } else {
                    // otherwise its equal to the F emoji
                    answer = '🇫';
                }

                // the createReactionCollector takes in a filter function, so we need to create the basis for what that filter is here
                const filter = (reaction) => {
                    // filters only the reactions that are equal to the answer
                    return reaction.emoji.name === answer;
                };

                // adds createReactionCollector to the embed we sent, so we can 'collect' all the correct answers
                const collector = msgEmbed.createReactionCollector(filter, { time: 10000 }); // will only collect for 10 seconds

                // an array that will hold all the users that answered correctly
                let usersWithCorrectAnswer = [];

                // starts collecting
                // r is reaction and user is user
                collector.on('collect', (r, user) => {
                    // if the user is not the bot, and the reaction given is equal to the answer
                    if (user.username !== bot.user.username && r.emoji.name === answer) {
                        // add the users that answered correctly to the usersWithCorrect Answer array
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

                // what will be executed when the collector completes
                collector.on('end', async () => {
                    // if no one got any answers right
                    if (usersWithCorrectAnswer.length === 0) {
                        // create an embed
                        let result = newEmbed.setTitle("Time's Up! No one got it....").setColor([168, 124, 124]);
                        // send the embed to the channel
                        message.channel.send(result);
                    } else {
                        // otherwise, create an embed with the results of the question
                        /* since the array is an array of strings, I used the javascript join() method to concat them, and then the replace() to replace the 
                        comma with a comma and a space, so its human readable and pleasant to the eye
                        */
                        let result = newEmbed
                            .setTitle("Time's Up! Here's who got it right:")
                            .setDescription(usersWithCorrectAnswer.join().replace(',', ', '))
                            .setColor([168, 124, 124]);
                        // send the embed to the channel
                        message.channel.send(result);
                    }
                });
                /* if I don't include a pause of some sort, then the for loop will RAPID FIRE send all the questions to the channel
                adding a pause here that is equal to the collection time (10 seconds) allows for time in between questions, and an 
                overall pleasant user experience
                */
                await wait(10000);
                // decrement the counter, tbh I don't know if having a counter is necessary now that I'm looking at this....we can fix this later
                counter--;
            }
            if (counter === 0) {
                let winnerEmbed = new MessageEmbed(); // create new embed instance

                // iterate over the leaderboard if winners exist (if the length of the object's keys isn't 0, then we have winners)
                if (Object.keys(leaderboard).length !== 0) {
                    // specify the contents of the embed
                    let winner = winnerEmbed.setTitle('**Game Over!**').setDescription('**Final Scores: **').setColor([168, 124, 124]);

                    // loop over the contents of the leaderboard, and add fields to the embed on every iteration
                    for (const key in leaderboard) {
                        winner.addField(`${key}:`, `${leaderboard[key]}`);
                    }
                    message.channel.send(winner);
                } else {
                    // if the leaderboard is empty, construct a different embed
                    winnerEmbed.setTitle('Game Over! No one got anything right...');
                    // send the embed to the channel
                    message.channel.send(winnerEmbed);
                }
            }
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
        message.channel.send('Stopping...').then((m) => {
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
