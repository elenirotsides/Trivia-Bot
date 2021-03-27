# Design Milestone

## Problem Statement

```
Remember, we are solving problems in the crowdsourcing market domain. This does not include problems, such as finding a parking spot, but it may include problems such as finding the most popular task, the most winning developer, finding the most complex/starving task, etc.

Most importantly, justify two questions: What is the problem? Why is it a problem?

This should be a good paragraph or two.
```

## Bot Description

Our bot’s main functionality is to provide users with a fun/easy-to-use trivia API that can be used on Discord. People will interact with each other and answer a wide variety of questions given by the bot. As with any trivia game scores will be kept as an incentive to win. The users we specifically want to use this bot are people of school organizations such as clubs or greek life. The reasoning behind this is because these organizations already have group chats in order to communicate with each other, so this will be a great addition to their cats, providing a new way to interact online. To utilize the bot, for example the President of a club can organize a trivia session as part of their weekly meetings and activates the bot using a specific command. The bot would then be activated and any other users that are in the meeting will be able to interact which will make online meetings a bit more enjoyable.

Based upon the way our bot works, it essentially responds to events created by the user. For example, “trivia multi” activates the trivia bot. They will then input certain fields such as the category, difficulty, and the number of questions before they start. Finally, as the bot asks questions people will respond with their answers. Clearly, this represents the bot just responding to events more than a bot maintaining conversation with the user.

Our tagline is: “Be Educated. Be Fun. Be Trivia on Discord."


## Use Cases

```
A use case is a way to describe a task that a user wants to perform and the required sequence of steps needed to accomplish that task. It may also include possible error states.

Based on your design, describe two use cases that describes the primary functionality of your bot.

This is an example use case:

Use Case: Browse open tasks

1 Preconditions

   None.

2 Main Flow

   User provides a current date in order to search  in the database for all tasks open on that day [S1]. Bot will display a list of task names for user to choose [S2]. Bot display detailed requirements of the task [S3].

3 Subflows

  [S1] User provides a data with a specific date format e.g. MM/DD/YYYY.

  [S2] Bot will return list of open tasks. User will make choice to check task details.

  [S3] Bot will display task details.

4 Alternative Flows

  [E1] No tasks are available on that day.

You can think of this as a set of conversations/interactions you want to be able to support with your bot.


```

## Design Sketches

```
- Create a  sequence flow or state transition mockup of your bot in action.
- Create a storyboard that illustrates the primary task that a user undergoes with bot.
```

## Architecture Design

```
- Create a diagram that illustrates the components of your bot, the platform it is embedded in, third party services it may use, data storage it may require, etc.
- Describe the architecture components in text.

This section should be several diagrams + paragraphs of text. This is the opportunity to really think through how you might build your system. Consider all the criteria listed here in your description. Generic architectures that do not properly reflect a solution will receive low scores.-
```

## Submission

Create a team repository for your bot, using the assigned github repository. Submit a link to your team repo. In your README.md, list all team members and their github ids. Add a DESIGN.md document (linked from README.md) with the following materials included.

## Deliverables

Problem Statement (15%)
Bot Description (10%)
Use Cases (15%)
Design Sketches (30%)
Architecture Design (30%)
