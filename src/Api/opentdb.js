import axios from 'axios';

export const getMultipleChoice = async () => {
  const response = await axios(
    `https://opentdb.com/api.php?amount=10&type=multiple`
  );
  return response.data.results;
};
