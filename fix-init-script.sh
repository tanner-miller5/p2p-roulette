#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing database initialization script...${NC}"

# Create scripts directory and initialization script
create_init_script() {
    mkdir -p server/src/scripts
    echo -e "${YELLOW}Creating database initialization script...${NC}"
    cat > "server/src/scripts/initDb.js" << 'EOL'
require('dotenv').config();
const { initializeDatabase } = require('../models');

async function init() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

init();
EOL
}

# Update package.json script
update_package_json() {
    echo -e "${YELLOW}Updating package.json script...${NC}"
    cd server
    if [ -f "package.json" ]; then
        # Add init-db script with correct path
        npm pkg set scripts.init-db="node src/scripts/initDb.js"
    fi
    cd ..
}

# Add models index if it doesn't exist
ensure_models_index() {
    mkdir -p server/src/models
    if [ ! -f "server/src/models/index.js" ]; then
        echo -e "${YELLOW}Creating models index file...${NC}"
        cat > "server/src/models/index.js" << 'EOL'
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

const Game = require('./game')(sequelize);
const Bet = require('./bet')(sequelize);
const User = require('./user')(sequelize);

Game.hasMany(Bet);
Bet.belongsTo(Game);
User.hasMany(Bet);
Bet.belongsTo(User);

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ force: true });
    console.log('Database synchronized.');

    // Create initial user if none exists
    const userCount = await User.count();
    if (userCount === 0) {
      await User.create({
        id: 'system',
        balance: 1000000
      });
      console.log('System user created.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
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
    fi
}

# Ensure .env file exists
ensure_env_file() {
    if [ ! -f "server/.env" ]; then
        echo -e "${YELLOW}Creating .env file...${NC}"
        cat > "server/.env" << 'EOL'
PORT=3001
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/p2p_roulette
CLIENT_URL=http://localhost:3000
EOL
    fi
}

# Check and install required dependencies
check_dependencies() {
    echo -e "${YELLOW}Checking and installing required dependencies...${NC}"
    cd server
    npm install --save \
        sequelize@6.35.2 \
        pg@8.11.3 \
        pg-hstore@2.3.4 \
        dotenv@16.3.1
    cd ..
}

# Main execution
echo -e "${YELLOW}Starting initialization script fix...${NC}"

if [ -d "server" ]; then
    create_init_script
    update_package_json
    ensure_models_index
    ensure_env_file
    check_dependencies

    echo -e "${GREEN}Initialization script fix completed!${NC}"
    echo -e "\n${YELLOW}Please follow these steps:${NC}"
    echo -e "1. Ensure PostgreSQL is running:"
    echo -e "   ${GREEN}docker-compose up -d${NC}"
    echo -e "2. Wait for PostgreSQL to be ready:"
    echo -e "   ${GREEN}sleep 5${NC}"
    echo -e "3. Initialize the database:"
    echo -e "   ${GREEN}cd server && node src/scripts/initDb.js${NC}"

    # Execute the steps automatically
    echo -e "\n${YELLOW}Executing steps automatically...${NC}"
    docker-compose up -d
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
    cd server && node src/scripts/initDb.js
else
    echo -e "${RED}Error: server directory not found!${NC}"
    exit 1
fi