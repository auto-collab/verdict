module.exports = {
  callOpenAI: jest.fn().mockResolvedValue({
    choices: [
      { message: { content: "*VERDICT: READ* Summary of the review" } },
    ],
  }),
};
