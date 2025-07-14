#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting test environment setup...${NC}"

# Create setupTests.js
create_setup_tests() {
    if [ ! -f "client/src/setupTests.js" ]; then
        echo -e "${YELLOW}Creating client/src/setupTests.js${NC}"
        cat > "client/src/setupTests.js" << 'EOL'
import '@testing-library/jest-dom';
import 'jest-environment-jsdom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
EOL
    fi
}

# Create jest.config.js
create_jest_config() {
    if [ ! -f "client/jest.config.js" ]; then
        echo -e "${YELLOW}Creating client/jest.config.js${NC}"
        cat > "client/jest.config.js" << 'EOL'
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
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
    fi
}

# Create file mock
create_file_mock() {
    if [ ! -d "client/__mocks__" ]; then
        mkdir -p "client/__mocks__"
    fi

    if [ ! -f "client/__mocks__/fileMock.js" ]; then
        echo -e "${YELLOW}Creating client/__mocks__/fileMock.js${NC}"
        cat > "client/__mocks__/fileMock.js" << 'EOL'
module.exports = 'test-file-stub';
EOL
    fi
}

# Update package.json test configuration
update_package_json() {
    echo -e "${YELLOW}Updating client/package.json test configuration...${NC}"
    # Add necessary test dependencies
    cd client
    npm install --save-dev \
        @testing-library/jest-dom@^6.1.5 \
        @testing-library/react@^14.1.2 \
        @testing-library/user-event@^14.5.1 \
        jest-environment-jsdom@^29.7.0 \
        identity-obj-proxy@^3.0.0 \
        babel-jest@^29.7.0
    cd ..
}

# Create a basic test example
create_example_test() {
    if [ ! -f "client/src/App.test.js" ]; then
        echo -e "${YELLOW}Creating client/src/App.test.js${NC}"
        cat > "client/src/App.test.js" << 'EOL'
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import App from './App';

test('renders welcome message', () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );

  const welcomeElement = screen.getByText(/Welcome to P2P Roulette/i);
  expect(welcomeElement).toBeInTheDocument();
});
EOL
    fi
}

# Main execution
echo -e "${YELLOW}Setting up test environment...${NC}"

if [ -d "client" ]; then
    create_setup_tests
    create_jest_config
    create_file_mock
    create_example_test
    update_package_json

    echo -e "${GREEN}Test environment setup completed!${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo -e "1. Run tests with: ${GREEN}npm test --workspace=client${NC}"
    echo -e "2. Check test coverage with: ${GREEN}npm test --workspace=client -- --coverage${NC}"
    echo -e "\n${YELLOW}Note:${NC} Make sure all your components are properly wrapped with Redux Provider and Router in tests."
else
    echo -e "${RED}Error: client directory not found!${NC}"
    exit 1
fi