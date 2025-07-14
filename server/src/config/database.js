const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true
  }
});

module.exports = sequelize;
