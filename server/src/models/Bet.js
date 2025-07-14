// server/src/models/Bet.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bet = sequelize.define('Bet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID,  // Changed from INTEGER to UUID
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'game_id',
      references: {
        model: 'games',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    betType: {
      type: DataTypes.ENUM('red', 'black'),
      allowNull: false,
      field: 'bet_type'
    },
    matched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    processed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'bets',
    timestamps: true,
    underscored: true
  });

  return Bet;
};