const mockModels = {
  Game: {
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  Bet: {
    create: jest.fn(),
  },
  User: {
    increment: jest.fn(),
  },
};

module.exports = mockModels;
