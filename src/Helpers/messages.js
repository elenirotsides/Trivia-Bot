export const createGameStartMessages = (userId, questionLengthInSeconds) => {
  const userStartedGameMessage = `<@${userId}> has started the game`;
  const timeTillStart = `Game will start in ${questionLengthInSeconds} seconds`;
  const initialMessage = `${userStartedGameMessage}\n${timeTillStart}`;
  return { initialMessage, updatedMessage: userStartedGameMessage };
};
