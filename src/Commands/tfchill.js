import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getTrueFalse } from '../API/opentdb.js';
import { getContentAndCorrectAnswerIndex } from '../Helpers/answers.js';
import { createTrueFalseAnswerButtons } from '../Helpers/buttons.js';
import { createGameStartMessage } from '../Helpers/messages.js';
import { getWinner } from '../Helpers/winner.js';
import { QUESTION_LENGTH_IN_SECONDS, QUESTION_LENGTH, ROUNDS } from '../Constants/index.js';

const tfchill = {
    data: new SlashCommandBuilder()
        .setName('tfchill')
        .setDescription(
            `${ROUNDS} question True/False trivia where all users can answer within the ${QUESTION_LENGTH_IN_SECONDS} second time limit.`
        ),
    async execute(interaction) {
        let triviaData;
        try {
            triviaData = await getTrueFalse();
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

            const answerButtons = createTrueFalseAnswerButtons();
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
            let correctAnswerCount = 0;
            let incorrectAnswerCount = 0;
            const usersThatHaveAnsweredQuestion = new Set();
            collector.on('collect', async (i) => {
                const userId = i.user.id;

                if (usersThatHaveAnsweredQuestion.has(userId)) {
                    return;
                }
                usersThatHaveAnsweredQuestion.add(userId);

                const buttonId = i.customId;
                const isCorrect = buttonId === answerIndex;

                if (isCorrect) {
                    const currentScore = leaderBoard.get(userId) || 0;
                    leaderBoard.set(userId, currentScore + 1);
                    correctAnswerCount++;
                } else {
                    incorrectAnswerCount++;
                }
                i.reply({
                    content: isCorrect ? 'Correct' : 'Wrong',
                    ephemeral: true,
                });
            });
            collector.on('end', () => {
                const totalAnswers = correctAnswerCount + incorrectAnswerCount;
                const correctMessage = `${correctAnswerCount}/${totalAnswers} guessed correctly`;

                questionInteraction.edit({
                    content: generateUpdatedQuestionContent(correctMessage),
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

export default tfchill;
