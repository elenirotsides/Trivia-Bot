import axios from 'axios';

const baseURL = 'https://opentdb.com/api.php';
const defaultParams = { amount: 10 };
const opentdbInstance = axios.create({ baseURL, params: defaultParams });

const multipleChoiceParams = { type: 'multiple' };
const trueFalseChoiceParams = { type: 'boolean' };

const getResultsFromResponse = (response) => response.data.results;

const getQuestionsFromAPI = async (questionsParams) => {
    const response = await opentdbInstance.get('', {
        params: questionsParams,
    });
    return getResultsFromResponse(response);
};

export const getMultipleChoice = () =>
    getQuestionsFromAPI(multipleChoiceParams);

export const getTrueFalse = () => getQuestionsFromAPI(trueFalseChoiceParams);
