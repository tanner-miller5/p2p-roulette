// server/src/models/Transaction.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING,  // Changed from UUID to STRING to match User model
      allowNull: false,
      field: 'user_id'
    },
    type: {
      type: DataTypes.ENUM('deposit', 'withdrawal', 'bet', 'win'),
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,  // Changed from DECIMAL to INTEGER for consistency
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'transactions',
    timestamps: true,
    underscored: true
  });

  // Define associations
  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Transaction;
};