const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Game = sequelize.define('Game', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    status: {
      type: DataTypes.ENUM(
        'INITIALIZING',
        'WAITING_FOR_PLAYERS',
        'BETTING_OPEN',
        'PROCESSING_BETS',
        'SPINNING',
        'RESULTS',
        'CLEANUP',
        'ERROR'
      ),
      allowNull: false,
      defaultValue: 'INITIALIZING'
    },
    result: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 36
        }
    },
    playerCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    errorMessage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'games',
    timestamps: true
  });

  return Game;
};