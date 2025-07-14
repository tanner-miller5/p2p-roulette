
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing connection issues...${NC}"

# Update manifest.json to remove logo references
update_manifest() {
    echo -e "${YELLOW}Updating manifest.json...${NC}"
    cat > "client/public/manifest.json" << 'EOL'
{
  "short_name": "P2P Roulette",
  "name": "P2P Roulette Game",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
EOL
}

# Update index.html to remove logo references
update_index_html() {
    echo -e "${YELLOW}Updating index.html...${NC}"
    cat > "client/public/index.html" << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="P2P Roulette Game"
    />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>P2P Roulette</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOL
}

# Update client package.json proxy
update_client_proxy() {
    echo -e "${YELLOW}Updating client package.json proxy...${NC}"
    # Use jq to modify the proxy field
    if command -v jq >/dev/null 2>&1; then
        jq '.proxy = "http://localhost:3001"' client/package.json > client/package.json.tmp
        mv client/package.json.tmp client/package.json
    else
        # Fallback to sed if jq is not available
        sed -i.bak 's/"proxy": "http:\/\/localhost:4000"/"proxy": "http:\/\/localhost:3001"/' client/package.json
        rm -f client/package.json.bak
    fi
}

# Update socket connection configuration
update_socket_config() {
    echo -e "${YELLOW}Updating socket configuration...${NC}"
    mkdir -p client/src/config

    # Create config file
    cat > "client/src/config/config.js" << 'EOL'
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  socketOptions: {
    transports: ['websocket'],
    upgrade: false,
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  }
};
EOL

    # Update useSocket hook
    cat > "client/src/hooks/useSocket.js" << 'EOL'
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { config } from '../config/config';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(config.apiUrl, config.socketOptions);

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.close();
    };
  }, []);

  return { socket };
};
EOL
}

# Create .env file for client
create_env_file() {
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > "client/.env" << 'EOL'
REACT_APP_API_URL=http://localhost:3001
EOL
}

# Main execution
echo -e "${YELLOW}Starting fixes...${NC}"

if [ -d "client" ]; then
    update_manifest
    update_index_html
    update_client_proxy
    update_socket_config
    create_env_file

    echo -e "${GREEN}Fixes have been applied successfully!${NC}"
    echo -e "${YELLOW}Please follow these steps:${NC}"
    echo -e "1. Stop any running development servers"
    echo -e "2. Clear your browser cache"
    echo -e "3. Run ${GREEN}npm install${NC} in the root directory"
    echo -e "4. Start the server: ${GREEN}npm run start:server${NC}"
    echo -e "5. Start the client: ${GREEN}npm run start:client${NC}"
else
    echo -e "${RED}Error: client directory not found!${NC}"
    exit 1
fi