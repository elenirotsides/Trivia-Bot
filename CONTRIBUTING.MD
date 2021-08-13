# Contributions are welcomed!

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

Replace `<your bot token>` with your bot token and get rid of the < >'s. **Please gitignore this file when pushing your work in a PR. Your bot token should be known by no one other than yourself!**

Make sure to run

```
npm install
```

to install all the project's required dependancies!

You can run your bot with `npm start` but if you want it to automatically refresh every time you save, you can use `npm run dev`

## Where to start

Please comment on any issue you'd like to take or open an issue to add something I haven't detailed out already. I'll decide later if its worth doing and will let you know. Or, open a PR with whatever you've done even if its not already fleshed out in an issue. **TLDR**; when in doubt, open a PR!
