import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getMultipleChoice } from '../API/opentdb.js';
import { getContentAndCorrectAnswerIndex } from '../Helpers/answers.js';
import { createMultipleChoiceAnswerButtons } from '../Helpers/buttons.js';
import { createGameStartMessage } from '../Helpers/messages.js';
import { getWinner } from '../Helpers/winner.js';
import { ROUNDS, QUESTION_LENGTH_IN_SECONDS, QUESTION_LENGTH } from '../Constants/index.js';

const mccompetitive = {
    data: new SlashCommandBuilder()
        .setName('mccompetitive')
        .setDescription(
            `${ROUNDS} question Multiple Choice trivia where only the 1st correct answer is accepted in the time limit.`
        ),
    async execute(interaction) {
        let triviaData;
        try {
            triviaData = await getMultipleChoice();
        } catch (e) {
            console.log(e);
            await interaction.reply({
                content:
                    'Uh oh, something has gone wrong while trying to get some questions. Please try again',
            });
            return;
        }

        const { initialMessage, updatedMessage } = createGameStartMessage(
            interaction.user.id,
            QUESTION_LENGTH_IN_SECONDS
        );

        await interaction.reply({
            content: initialMessage,
        });

        const leaderBoard = new Map();
        let haveUpdatedOriginalMessage = false;
        let counter = 0;

        const myInterval = setInterval(async () => {
            if (!haveUpdatedOriginalMessage) {
                await interaction.editReply({
                    content: updatedMessage,
                });
            }
            haveUpdatedOriginalMessage = true;
            const triviaRound = triviaData[counter];

            const { answerIndex, questionContent, generateUpdatedQuestionContent } =
                getContentAndCorrectAnswerIndex(triviaRound);

            const answerButtons = createMultipleChoiceAnswerButtons();
            const questionInteraction = await interaction.followUp({
                content: questionContent,
                components: [answerButtons],
            });
            const collector = interaction.channel.createMessageComponentCollector({
                // Component type button
                componentType: 2,
                // Gives time for the question to end before the next question starts
                time: QUESTION_LENGTH - 1000,
            });
            const usersThatHaveAnsweredQuestion = new Set();
            let correctuser = '';

            // Collect only runs if the filter passes
            collector.on('collect', async (buttonClickInteraction) => {
                const userId = buttonClickInteraction.user.id;

                if (usersThatHaveAnsweredQuestion.has(userId)) {
                    return buttonClickInteraction.reply({
                        content: 'You have already guessed',
                        ephemeral: true,
                    });
                }
                usersThatHaveAnsweredQuestion.add(userId);

                const buttonId = buttonClickInteraction.customId;
                const isCorrect = buttonId === answerIndex;

                if (isCorrect) {
                    const currentScore = leaderBoard.get(userId) || 0;
                    leaderBoard.set(userId, currentScore + 1);
                    correctuser = buttonClickInteraction.user.username;
                    collector.stop();
                }
                return buttonClickInteraction.reply({
                    content: isCorrect ? 'Correct' : 'Wrong',
                    ephemeral: true,
                });
            });
            collector.on('end', () => {
                questionInteraction.edit({
                    content: generateUpdatedQuestionContent(
                        `${correctuser || 'Nobody'} guessed correctly`
                    ),
                    components: [],
                });
            });

            counter++;
            if (counter === ROUNDS) {
                clearInterval(myInterval);

                setTimeout(async () => {
                    const leaderBoardResults = getWinner(leaderBoard);

                    const winnerEmbed = new EmbedBuilder();
                    winnerEmbed
                        .setColor('#fb94d3')
                        .setTitle('Game Over!')
                        .setDescription(leaderBoardResults)
                        .setTimestamp();

                    await interaction.followUp({
                        embeds: [winnerEmbed],
                    });
                }, QUESTION_LENGTH);
            }
        }, QUESTION_LENGTH);
    },
};

export default mccompetitive;
