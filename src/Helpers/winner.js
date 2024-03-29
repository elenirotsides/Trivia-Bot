export const getWinner = (leaderBoard) =>
    Object.entries(Object.fromEntries(leaderBoard))
        .map(([key, value]) => ({ id: key, score: value }))
        .sort((a, b) => (a.score < b.score ? 1 : -1))
        .map(({ id, score }, index) => `${index + 1}. ${`<@${id}>`} - ${score}`)
        .join('\n') || 'There was no winner';
