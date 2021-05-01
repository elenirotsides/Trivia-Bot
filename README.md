# Trivia Bot

## What is Trivia Bot?

Trivia Bot is a fun and fully functional Discord bot that serves the purpose of satisfying your Trivia craving! There are many different modes of Trivia that you can play, either by yourself or with others in your Discord Server. We've made use of the Open Trivia Database API for the trivia questions that we use in the game, so shout out to them for the really cool API! You can find out more about that [here](https://opentdb.com/).

## Commands

There are many different commands you can use to interact with Trivia Bot. _This section will be evolving as we continue to add more features!_ Here is what we currently have going on:

-   `-play tf chill` Starts a round of chill T/F Trivia.
-   `-play tf competitive` Starts a round of competitive T/F Trivia.
-   `-play mc chill` Starts a round of chill Multiple Choice Trivia.
-   `-play mc competitive` Starts a round of competitive Multiple Choice Trivia.
-   `-help` Lists out all the commands that Trivia Bot responds to, and what they do.
-   🛑 Stops the current Trivia game

The difference between `chill` and `competitive`:

`chill` allows all users to select an answer within the time limit
`competitive` only accepts the first correct answer; everyone else loses by default

You can also append `help` to any of the play commands to learn more about the different game modes, like so:

-   `-play tf help` Will list out all the different True & False game modes Trivia Bot can provide, and details about each.
-   `-play mc help` Will list out all the different Multiple Choice game modes Trivia Bot can provide, and details about each.

_In the future, we plan on making more commands that respond to customizable game requests, like allowing the user to select how many questions they want, which category, which difficulty, and the time limit per question._

## Installation

The (recommended) instructions on how to get Trivia Bot up and running in your Discord server are outlined below:

_Prerequisites: You must have Node and NPM installed since this is a Node.js project. Please see [this website](https://www.npmjs.com/get-npm) for installation instructions before proceeding._

1. Fork this repository
2. Create a clone of your fork so that you can make changes

```
git clone <your fork's URL>.git
```

3. Once you've done that, navigate to the root of the `Trivia-Bot` directory on your local machine (or wherever you cloned your fork) and create a `.env` file. In here, you need to create an enviornment variable like so:

```
BOT_TOKEN=<your bot token>
```

_If you don't have a bot token, I recommend following the directions [here](https://www.writebots.com/discord-bot-token/). The author of this article did a fantastic job in explaining the process of getting a token and navigating the Discord Developer Portal (which is very simple and painless! Shout out to the Discord team for making this experience seamless!)_

Replace `<your bot token>` with your bot token and get rid of the < >'s

_At this point, you're good to go! To run the bot, you just have to do `npm start` in your terminal. However, you'll need to do this every time you want your bot to come online. If you want your bot to be online 24/7, continue reading._

Skip step 3 above and instead, deploy your bot to Heroku (doesn't have to be Heroku, but I like this platform because it is super easy to use, naviagate, and deploy to. Its also FREE!)

3. Create an account if you don't already have one. (Don't worry, this is free as well!)
4. Create a new app in Heroku by clicking `New` and then `Create new app`. (There may or may not be an intermediate step you need to do at this point, I admittedly cannot remember. I think it might ask about what kind of project this is, and if it does, select the Node.js option.)
5. Click on the `Deploy` tab
6. Deployment method will be `GitHub`, so click on that
7. Search for your fork of this repository in the `Connect to GitHub` section, find the branch you'd like to connect to (it'll probably be `main` unless your goals are different) and then click `Connect`.
8. Select `Enable Automatic Deploy` so that Heroku gets the new code automatically, if you're planning on making changes.
9. Click on the `Settings` and then click `Reveal Config Vars`. In here, you will add `BOT_TOKEN` as the key, and your bot token as the value.
10. Click `Add`
11. Go back to the `Deploy` tab and then scroll down to the `Manual Deploy` section and click `Deploy Branch`
12. Lastly, you need to navigate to the `Resources` tab. Here, you'll need to turn off the `web npm start` option and instead, turn on the `Worker node src/bot.js` option. You might not see it right away, so just wait a minute or two and then refresh. (The `Procfile` is what is giving Heroku instructions, so this is why it may take a second or two after deploying for Heroku to recieve this instruction.)

That's it! Your bot is now online! Logs of the deployment can be found by going to `More` and then selecting `View logs`.

Happy Trivia'ing!

## Team Members

Eleni Rotsides [@elenirotsides](https://github.com/elenirotsides)

Sylvia Boamah [@sboamah](https://github.com/sboamah)

Joshua Hector [@Jhector10](https://github.com/Jhector10)

Julio Lora [@jlora23](https://github.com/jlora23)

[Go to DESIGN.md](https://github.com/elenirotsides/SSW-345-Project/blob/main/DESIGN.md) to view Design Milestone details

## Design Workshop Lab

### Read through seed ideas. Select 1-2 you might want to work on.

```
Trivia Bot
```

### Describe the problems. (10 minutes)

1. What is the core problem each bot is trying to solve?

    Since school and life in general has transitioned to being online, it has been difficult to participate in virtual events that are fun like they used to be. The problem this bot is trying to solve is the issue of feeling disconnected.

2. Why is it a problem worth solving?

    Just because life is virtual now, doesn't mean it has to be boring! School events and virtual gatherings shouldn't have to be bland just because we can't be together! Trivia Bot will bring the fun back to events like it used to be pre-pandemic. The goal is to make groups of people feel connected again.

### Describe possible designs: (10 minutes)

1. What is the core product idea?

    To provide a virtual trivia game in the Discord application where users can compete and have fun.

2. What are patterns that might be useful?

    Alerts, timers, reminders
