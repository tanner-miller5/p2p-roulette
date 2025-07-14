
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing database connection issues...${NC}"

# Update Docker Compose file
update_docker_compose() {
    echo -e "${YELLOW}Updating docker-compose.yml...${NC}"
    cat > "docker-compose.yml" << 'EOL'
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: p2p_roulette_db
    environment:
      POSTGRES_DB: p2p_roulette
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7
    container_name: p2p_roulette_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
EOL
}

# Update server environment configuration
create_server_env() {
    echo -e "${YELLOW}Creating server/.env file...${NC}"
    mkdir -p server
    cat > "server/.env" << 'EOL'
PORT=3001
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/p2p_roulette
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:3000
EOL
}

# Update database configuration
update_database_config() {
    mkdir -p server/src/config
    echo -e "${YELLOW}Creating database configuration...${NC}"
    cat > "server/src/config/database.js" << 'EOL'
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    max: 5
  }
});

module.exports = sequelize;
EOL
}

# Update server models to use new database config
update_models() {
    mkdir -p server/src/models
    echo -e "${YELLOW}Updating database models...${NC}"
    cat > "server/src/models/index.js" << 'EOL'
const sequelize = require('../config/database');
const defineGame = require('./game');
const defineBet = require('./bet');
const defineUser = require('./user');

const Game = defineGame(sequelize);
const Bet = defineBet(sequelize);
const User = defineUser(sequelize);

Game.hasMany(Bet);
Bet.belongsTo(Game);
User.hasMany(Bet);
Bet.belongsTo(User);

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');

    // Create initial user if none exists
    const userCount = await User.count();
    if (userCount === 0) {
      await User.create({
        balance: 1000,
        gamesPlayed: 0,
        gamesWon: 0
      });
      console.log('Initial user created.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Game,
  Bet,
  User,
  initializeDatabase
};
EOL
}

# Update server entry point
update_server_index() {
    echo -e "${YELLOW}Updating server entry point...${NC}"
    cat > "server/src/index.js" << 'EOL'
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { initializeDatabase } = require('./models');
const initializeSocket = require('./socket');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Initialize Socket.IO
    const io = initializeSocket(server);

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
EOL
}

# Update dependencies
update_dependencies() {
    echo -e "${YELLOW}Updating server dependencies...${NC}"
    cd server
    npm install --save \
        pg@8.11.3 \
        pg-hstore@2.3.4 \
        sequelize@6.35.2 \
        redis@4.6.7 \
        dotenv@16.3.1
    cd ..
}

# Create database initialization script
create_init_script() {
    echo -e "${YELLOW}Creating database initialization script...${NC}"
    cat > "init-database.sh" << 'EOL'
#!/bin/bash

echo "Waiting for PostgreSQL to start..."
until docker exec p2p_roulette_db pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
done

echo "PostgreSQL is ready!"
EOL
    chmod +x init-database.sh
}

# Main execution
echo -e "${YELLOW}Starting database connection fix...${NC}"

if [ -d "server" ]; then
    update_docker_compose
    create_server_env
    update_database_config
    update_models
    update_server_index
    update_dependencies
    create_init_script

    echo -e "${GREEN}Database connection configuration completed!${NC}"
    echo -e "\n${YELLOW}Please follow these steps:${NC}"
    echo -e "1. Stop any running PostgreSQL instances on port 5432"
    echo -e "2. Start the database containers:"
    echo -e "   ${GREEN}docker-compose up -d${NC}"
    echo -e "3. Wait for database initialization:"
    echo -e "   ${GREEN}./init-database.sh${NC}"
    echo -e "4. Install dependencies:"
    echo -e "   ${GREEN}npm install${NC}"
    echo -e "5. Start the server:"
    echo -e "   ${GREEN}npm run start:server${NC}"
    echo -e "6. Start the client:"
    echo -e "   ${GREEN}npm run start:client${NC}"
else
    echo -e "${RED}Error: server directory not found!${NC}"
    exit 1
fi