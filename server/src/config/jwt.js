require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

module.exports = {
  secret: process.env.JWT_SECRET,
  options: {
    expiresIn: '24h',
    algorithm: 'HS256'
  }
};