const { Game, Bet, User } = require('../models');
const gameService = require('../services/gameService');

jest.mock('../models');

describe('GameService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    it('should create a new game', async () => {
      const mockGame = { id: 1 };
      Game.create.mockResolvedValue(mockGame);

      const result = await gameService.createGame();

      expect(Game.create).toHaveBeenCalledWith({
        status: 'waiting',
        startTime: expect.any(Date)
      });
      expect(result).toBe(mockGame);
    });
  });

  describe('placeBet', () => {
    it('should create a new bet', async () => {
      const mockBet = { id: 1 };
      gameService.currentGame = { id: 1 };
      Bet.create.mockResolvedValue(mockBet);

      const result = await gameService.placeBet(1, 100, 'red');

      expect(Bet.create).toHaveBeenCalledWith({
        gameId: 1,
        userId: 1,
        amount: 100,
        betType: 'red'
      });
      expect(result).toBe(mockBet);
    });
  });

  describe('generateResult', () => {
    it('should return either red or black', () => {
      const result = gameService.generateResult();
      expect(['red', 'black']).toContain(result);
    });
  });

  describe('processWinnings', () => {
    it('should process winnings correctly', async () => {
      const mockGame = {
        result: 'red',
        Bets: [
          {
            betType: 'red',
            amount: 100,
            User: { increment: jest.fn() }
          }
        ]
      };
      Game.findByPk.mockResolvedValue(mockGame);

      await gameService.processWinnings(1);

      expect(mockGame.Bets[0].User.increment).toHaveBeenCalledWith('balance', { by: 200 });
      expect(mockGame.Bets[0].User.increment).toHaveBeenCalledWith('gamesWon');
      expect(mockGame.Bets[0].User.increment).toHaveBeenCalledWith('totalGames');
    });
  });
});
