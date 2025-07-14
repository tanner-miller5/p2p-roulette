const userService = require('../services/userService');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userData = await userService.login(username, password);
    console.log('UserData:', userData);
    res.json(userData);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userData = await userService.register(username, password);
    res.json(userData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const validateToken = async (req, res) => {
  try {
    // The user data is already attached to req by the auth middleware
    const user = await userService.getUserById(req.user.id);
    res.json({
      username: user.username,
      balance: user.wallet ? user.wallet.balance : 0
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.json({
      username: user.username,
      balance: user.wallet ? user.wallet.balance : 0,
      statistics: {
        totalGames: user.statistics?.totalGames || 0,
        gamesWon: user.statistics?.gamesWon || 0,
        totalBets: user.statistics?.totalBets || 0,
        totalWinnings: user.statistics?.totalWinnings || 0
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
  login,
  register,
  validateToken,
  getProfile
};