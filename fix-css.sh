#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting CSS fix...${NC}"

# Create index.css file
create_css_file() {
    if [ ! -f "client/src/index.css" ]; then
        echo -e "${YELLOW}Creating client/src/index.css${NC}"
        cat > "client/src/index.css" << 'EOL'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #282c34;
  color: #ffffff;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
EOL
    fi
}

# Main execution
if [ -d "client/src" ]; then
    create_css_file
    echo -e "${GREEN}CSS file has been created successfully!${NC}"
    echo -e "${YELLOW}Restart your development server to apply changes.${NC}"
else
    echo -e "${RED}Error: client/src directory not found!${NC}"
    exit 1
fi