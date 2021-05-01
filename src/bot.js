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

            let triviaData;
             // will hold the response that the api gave after a successful request
            try {
                // the api call is wrapped in a try/catch because it can fail, and we don't want our program to crash
                triviaData = await (await axios(`https://opentdb.com/api.php?amount=10&type=multiple`)).data.results;
            } catch (e) {
                // if the api call does fail, we log the result and then send a cute lil error to the channel
                console.log(e);
                message.channel.send('Uh oh, something has gone wrong while trying to get some questions. Please try again');
            }

            // looping over the length of the api response, and adding entries to the triviaData object with all the data we need in a structure that works for us
        
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
        
                function shuffle(array) {
                    var currentIndex = array.length, randomIndex, temporaryValue;
                  
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


            /* and now the fun begins.....
            Loops over the contents of triviaData, and sends the question in an embed after the completion of the embed construction
            */
            for (let i = 0; i < triviaData.length; i++) {
                let choices = [`${triviaData[i].correct_answer}`];
                for (let j = 0; j < 3; j++) {
                    choices.push(`${triviaData[i].incorrect_answers[j]}`);
                }
                shuffle(choices);  
        
                embed
                    .setTitle(`Question ${i + 1}`) // Title dynamically updates depending on which iteration we're on
                    .setColor(0xff0000) // color of the embed for multiple choice
                    .setDescription(
                        // the meat and potatoes of the embed
                        parseEntities(triviaData[i].question) // the question
                            + '\n'
                            + '\n**Choices:**'
                            +'\n'
                            + '\n 🇦 '+  parseEntities(choices[0])
                            +'\n 🇧 ' +  parseEntities(choices[1])
                            + '\n 🇨 '+  parseEntities(choices[2])
                            +'\n 🇩 ' +  parseEntities(choices[3])
                            +'\n'
                            + '\n**Difficulty:** ' + // putting double ** bolds the text, and single * italicizes it (in the Discord application)
                            parseEntities(triviaData[i].difficulty) + // difficulty
                            '\n**Category:** ' +
                            parseEntities(triviaData[i].category) // category
                            
                    );

                let msgEmbed = await message.channel.send(embed); // sends the embed 
                msgEmbed.react('🇦'); // adds a universal A emoji
                msgEmbed.react('🇧'); // adds a universal B emoji
                msgEmbed.react('🇨'); // adds a universal C emoji
                msgEmbed.react('🇩'); // adds a universal D emoji
                msgEmbed.react('🛑'); // add a stop reaction
                
                  

                let answer = ''; // instantiate empty answer string, where correctAns will be housed
                if (triviaData[i].correct_answer === choices[0] ) {
                    // if the correct answer is in index 0, answer is equal to the A emoji
                    answer = '🇦';
                } if (triviaData[i].correct_answer === choices[1] ) {
                    // if the correct answer is in index 1, answer is equal to the B emoji
                    answer = '🇧';
                }
                if (triviaData[i].correct_answer  === choices[2]) {
                    // if the correct answer is in index 2, answer is equal to the C emoji
                    answer = '🇨';
                }
                if (triviaData[i].correct_answer  === choices[3]) {
                    // otherwise its equal to the D emoji
                    answer = '🇩';
                }

                // the createReactionCollector takes in a filter function, so we need to create the basis for what that filter is here
                const filter = (reaction, user) => {
                    // filters only the reactions that are equal to the answer
                    return (reaction.emoji.name === answer || reaction.emoji.name === '🛑') && user.username !== bot.user.username;
                };

                // adds createReactionCollector to the embed we sent, so we can 'collect' all the correct answers
                const collector = msgEmbed.createReactionCollector(filter, { time: 10000 }); // will only collect for 10 seconds

                // an array that will hold all the users that answered correctly
                let usersWithCorrectAnswer = [];

                // starts collecting
                // r is reaction and user is user
                collector.on('collect', (r, user) => {
                    // if the user is not the bot, and the reaction given is equal to the answer
                    // add the users that answered correctly to the usersWithCorrect Answer array
                    if (r.emoji.name === '🛑') {
                        counter = 0; 
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

                // what will be executed when the collector completes
                collector.on('end', async () => {
                    // if no one got any answers right
                    if (usersWithCorrectAnswer.length === 0) {
                        // create an embed
                        let result = newEmbed.setTitle("Time's Up! No one got it....").setColor([168, 124, 124])
                        .setDescription('\n The correct answer was '+ parseEntities(triviaData[i].correct_answer));

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
                            .setFooter('\n The correct answer was '+ parseEntities(triviaData[i].correct_answer))
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

        if (command === 'play' && args[0] === 'mc' && args[1] === 'help' && args.length === 2) {
            // command must be -play tf help, so that's what this conditional is looking for in order to successfully execute
            const embed = new MessageEmbed(); // creates new embed instance

            // setting the fields for the embed
            embed
                .setColor(0xffff00)
                .setTitle('MC Modes')
                .addField(
                    '`-play mc chill`',
                    'Initiates a round of 10 question Multiple Choice trivia with random difficulties and random categories. Its `chill` because this mode allows all users to attempt to answer within the 10 second time limit.'
                )
                .addField(
                    '`-play mc competitive`',
                    'Initiates a round of 10 question Multiple Choice trivia with random difficulties and random categories. Its `competitive` because this will only accept the first person that guesses correctly; everyone else loses by default. **TLDR; you have to be the first to answer correctly!**'
                );
            // sends the embed to the channel
            message.channel.send(embed);
        }

        if (command === 'play' && args[0] === 'tf' && args[1] === 'chill' && args.length === 2) {
            // command must be -play tf chill, so that's what this conditional is looking for in order to successfully execute

            // sends a cute lil message to the channel letting the users know that a game will begin
            message.channel.send('Lemme grab some questions for ya....');

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
                    .setColor(0xff0000) // color of the embed
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
                    return (reaction.emoji.name === answer || reaction.emoji.name === '🛑') && user.username !== bot.user.username;
                };

                // adds createReactionCollector to the embed we sent, so we can 'collect' all the correct answers
                const collector = msgEmbed.createReactionCollector(filter, { time: 10000 }); // will only collect for 10 seconds

                // an array that will hold all the users that answered correctly
                let usersWithCorrectAnswer = [];

                // starts collecting
                // r is reaction and user is user
                collector.on('collect', (r, user) => {
                    // if the user is not the bot, and the reaction given is equal to the answer
                    // add the users that answered correctly to the usersWithCorrect Answer array
                    if (r.emoji.name === '🛑') {
                        counter = 0;
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
                if (counter === 0) {
                    break;
                }
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

        if (command === 'play' && args[0] === 'tf' && args[1] === 'competitive' && args.length === 2){
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
                    .setColor(0xff0000)
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
                    return (reaction.emoji.name === answer || reaction.emoji.name === '🛑') && user.username !== bot.user.username;
                };

                const collector = msgEmbed.createReactionCollector(filter, { max: 1,time: 10000 }); 

                let userWithCorrectAnswer = [];

                collector.on('collect', (r, user) => {
                    //message.channel.send(user.username)
                    // add the users that answered correctly to the usersWithCorrect Answer array
                    if (r.emoji.name === '🛑') {
                        counter = 0;
                    }
                    else {
                    userWithCorrectAnswer.push(user.username);
                    if (leaderboard[user.username] === undefined) {
                        // if the user isn't already in the leaderboard object, add them and give them a score of 1
                        leaderboard[user.username] = 1;
                    } else {
                        // otherwise, increment the user's score
                        leaderboard[user.username] += 1;
                    }
                }});
                let newEmbed = new MessageEmbed(); 

                collector.on('end', async () => {
                    // if no one got any answers right
                    if (userWithCorrectAnswer.length === 0) {
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
                            .setDescription(userWithCorrectAnswer.join().replace(',', ', '))
                            .setTitle("That's IT! Here's who is the first to get it right:")
                            .setDescription(userWithCorrectAnswer.join().replace(',', ', '))
                            .setColor([168, 124, 124]);
                        // send the embed to the channel
                        message.channel.send(result);
                    }
                });
                await wait(10000);
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

        if (command === 'play' && args[0] === 'mc' && args[1] === 'competitive' && args.length === 2) {
            // command must be -play mc competitive, so that's what this conditional is looking for in order to successfully execute

            // sends a cute lil message to the channel letting the users know that a game will begin
            message.channel.send('Lemme grab some questions for ya....');

            /* creating empty trivia data variable for this round of trivia
            It will be filled with data that was queried from the api, like so:
            (the api sends it as an array of objects)

            [
                {
                    category: "Entertainment: Television",
                    type: "multiple",
                    difficulty: "medium",
                    question: "In the original Doctor Who series (1963), fourth doctor Tom Baker&#039;s scarf was how long?",
                    correct_answer: "7 Meters",
                    incorrect_answers: [
                        "10 Meters",
                        "2 Meters",
                        "5 Meters"
                    ]
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
                triviaData = await (await axios(`https://opentdb.com/api.php?amount=10&type=multiple`)).data.results;
            } catch (e) {
                // if the api call does fail, we log the result and then send a cute lil error to the channel
                console.log(e);
                message.channel.send('Uh oh, something has gone wrong while trying to get some questions. Please try again');
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

            function shuffle(array) {
                var currentIndex = array.length, randomIndex, temporaryValue;

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

            /* and now the fun begins.....
            Loops over the contents of triviaData, and sends the question in an embed after the completion of the embed construction
            */
            for (let i = 0; i < triviaData.length; i++) {
                let choices = [`${triviaData[i].correct_answer}`]; // for testing, inputs the correct answer as the first choice for each question
                for (let j = 0; j < 3; j++) {
                    // adds the incorrect answers into the choices array created before
                    choices.push(`${triviaData[i].incorrect_answers[j]}`);
                }
                shuffle(choices);

                embed
                    .setTitle(`Question ${i + 1}`) // Title dynamically updates depending on which iteration we're on
                    .setColor(0xff0000) // color of the embed
                    .setDescription(
                        // the meat and potatoes of the embed
                        parseEntities(triviaData[i].question) + // the question
                            '\n' + // added a space
                            '\n**Choices**' + // added a space
                            '\n' +
                            '\n🇦 ' +
                            parseEntities(choices[0]) + // outputs the choices from the array 'choices'
                            '\n🇧 ' +
                            parseEntities(choices[1]) +
                            '\n🇨 ' +
                            parseEntities(choices[2]) +
                            '\n🇩 ' +
                            parseEntities(choices[3]) +
                            '\n' +
                            '\n**Difficulty:** ' + // putting double ** bolds the text, and single * italicizes it (in the Discord application)
                            parseEntities(triviaData[i].difficulty) + // difficulty
                            '\n**Category:** ' +
                            parseEntities(triviaData[i].category) // category
                    );

                let msgEmbed = await message.channel.send(embed); // sends the embed
                msgEmbed.react('🇦'); // adds a universal A emoji
                msgEmbed.react('🇧'); // adds a universal B emoji
                msgEmbed.react('🇨'); // and so on...
                msgEmbed.react('🇩');
                msgEmbed.react('🛑');

                let answer = ''; // instantiate empty answer string, where correctAns will be housed

                if (triviaData[i].correct_answer === choices[0]) {
                    // if the correct answer is the instance in the array, answer is equal to the corresponding letter emoji
                    answer = '🇦';
                } else if (triviaData[i].correct_answer === choices[1]) {
                    // otherwise its incorrect emoji
                    answer = '🇧';
                } else if (triviaData[i].correct_answer === choices[2]) {
                    // otherwise its incorrect emoji
                    answer = '🇨';
                } else {
                    answer = '🇩';
                }

                // the createReactionCollector takes in a filter function, so we need to create the basis for what that filter is here
                const filter = (reaction, user) => {
                    // filters only the reactions that are equal to the answer
                    return (reaction.emoji.name === answer || reaction.emoji.name === '🛑') && user.username !== bot.user.username;
                };

                // adds createReactionCollector to the embed we sent, so we can 'collect' all the correct answers
                const collector = msgEmbed.createReactionCollector(filter, { max: 1, time: 10000 }); // will only collect for 10 seconds, and take one correct answer

                // an array that will hold all the users that answered correctly
                let usersWithCorrectAnswer = [];

                // starts collecting
                // r is reaction and user is user
                collector.on('collect', (r, user) => {
                    // if the user is not the bot, and the reaction given is equal to the answer
                    // add the users that answered correctly to the usersWithCorrect Answer array
                    if (r.emoji.name === '🛑') {
                        counter = 0;
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

                // what will be executed when the collector completes
                collector.on('end', async () => {
                    // if no one got any answers right
                    if (usersWithCorrectAnswer.length === 0) {
                        // create an embed
                        let result = newEmbed.setTitle("Time's Up! No one got it....").setColor([168, 124, 124])
                        .setDescription('\n The correct answer was ' + parseEntities(triviaData[i].correct_answer));
                        // send the embed to the channel
                        message.channel.send(result);
                    } else {
                        // otherwise, create an embed with the results of the question
                        /* since the array is an array of strings, I used the javascript join() method to concat them, and then the replace() to replace the 
                        comma with a comma and a space, so its human readable and pleasant to the eye
                        */
                        let result = newEmbed
                            .setTitle("That's IT! Here's who is the first to get it right:")
                            .setDescription(usersWithCorrectAnswer.join().replace(',', ', '))
                            .setFooter('\n The correct answer was ' + parseEntities(triviaData[i].correct_answer))
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
                    '**Useful Commands** \n`-help` Display all the commands \
                    \n`-play tf help` Gives more detail on the different modes in a T/F game \
                    \n`-play mc help` Gives more detail on the different modes in a Multiple Choice game \
                    \n`-play tf chill` Starts a round of chill T/F Trivia \
                    \n`-play mc chill` Starts a round of chill Multiple Choice Trivia \
                    \n`-play tf competitive` Starts a round of competitive T/F Trivia \
                    \n`-play mc competitive` Starts a round of competitive Multiple Choice Trivia \
                    \n`🛑` During the game, stop the game completely and tally the current totals by pressing this emoji reaction'
                );
            message.channel.send(embed);
        }
    }


    if (message.content.toLocaleLowerCase().includes('trivia')) {
        //should work without the bot on???
        let responseArray = ['Did someone say my name?', 'You called?', 'Looking for me?'];
        let randomIndex = Math.floor(Math.random() * responseArray.length);
        message.channel.send(responseArray[randomIndex]);
    }
});

bot.login(process.env.BOT_TOKEN);
