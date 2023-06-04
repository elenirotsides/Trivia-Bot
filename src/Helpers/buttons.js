import { ActionRowBuilder, ButtonStyle, ButtonBuilder } from 'discord.js';

const createAnswerButtons = (answers) => {
    const answerButtons = answers.map((answer, index) =>
        new ButtonBuilder()
            .setCustomId(index.toString())
            .setLabel(answer)
            .setStyle(ButtonStyle.Primary)
    );
    return new ActionRowBuilder({ components: [...answerButtons] });
};

export const createTrueFalseAnswerButtons = () => {
    const trueFalseAnswers = ['True', 'False'];
    return createAnswerButtons(trueFalseAnswers);
};

export const createMultipleChoiceAnswerButtons = () => {
    const multipleChoiceAnswers = ['A', 'B', 'C', 'D'];
    return createAnswerButtons(multipleChoiceAnswers);
};
