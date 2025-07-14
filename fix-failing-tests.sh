
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting to fix failing tests...${NC}"

# Create server-side test mocks
create_server_mocks() {
    if [ ! -d "server/__mocks__" ]; then
        mkdir -p "server/__mocks__"
    fi

    # Create mock for models
    echo -e "${YELLOW}Creating server/__mocks__/models.js${NC}"
    cat > "server/__mocks__/models.js" << 'EOL'
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
EOL
}

# Create server-side tests
create_server_tests() {
    if [ ! -d "server/src/__tests__" ]; then
        mkdir -p "server/src/__tests__"
    fi

    # Create GameService test
    echo -e "${YELLOW}Creating server/src/__tests__/gameService.test.js${NC}"
    cat > "server/src/__tests__/gameService.test.js" << 'EOL'
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
EOL

    # Update package.json for server tests
    echo -e "${YELLOW}Updating server/package.json test configuration...${NC}"
    if [ -f "server/package.json" ]; then
        cd server
        npm install --save-dev \
            jest@^29.7.0 \
            @babel/core@^7.23.4 \
            @babel/preset-env@^7.23.4

        # Add test script if not exists
        if ! grep -q '"test"' package.json; then
            sed -i '' '/"scripts": {/a\
    "test": "jest",
' package.json
        fi
        cd ..
    fi
}

# Create or update jest.config.js for server
create_server_jest_config() {
    echo -e "${YELLOW}Creating server/jest.config.js${NC}"
    cat > "server/jest.config.js" << 'EOL'
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
EOL
}

# Create client-side test utils
create_client_test_utils() {
    if [ ! -d "client/src/utils/__tests__" ]; then
        mkdir -p "client/src/utils/__tests__"
    fi

    echo -e "${YELLOW}Creating client/src/utils/test-utils.js${NC}"
    cat > "client/src/utils/test-utils.js" << 'EOL'
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

function render(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {},
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
export { render };
EOL
}

# Update client App.test.js
update_app_test() {
    echo -e "${YELLOW}Updating client/src/App.test.js${NC}"
    cat > "client/src/App.test.js" << 'EOL'
import React from 'react';
import { render, screen } from './utils/test-utils';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    const welcomeElement = screen.getByText(/Welcome to P2P Roulette/i);
    expect(welcomeElement).toBeInTheDocument();
  });
});
EOL
}

# Main execution
echo -e "${YELLOW}Starting test fixes...${NC}"

# Fix server-side tests
if [ -d "server" ]; then
    create_server_mocks
    create_server_tests
    create_server_jest_config
    echo -e "${GREEN}Server tests fixed!${NC}"
fi

# Fix client-side tests
if [ -d "client" ]; then
    create_client_test_utils
    update_app_test
    echo -e "${GREEN}Client tests fixed!${NC}"
fi

echo -e "${GREEN}Test fixes completed!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Run server tests: ${GREEN}npm test --workspace=server${NC}"
echo -e "2. Run client tests: ${GREEN}npm test --workspace=client${NC}"
echo -e "3. Check coverage: ${GREEN}npm test -- --coverage${NC}"