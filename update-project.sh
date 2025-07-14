
#!/bin/bash

# Function to create/update a file with content
update_file() {
    local file_path="$1"
    local content="$2"
    mkdir -p "$(dirname "$file_path")"
    echo "$content" > "$file_path"
    echo "Updated: $file_path"
}

# Remove TypeScript and Vite related files
echo "Removing TypeScript and Vite related files..."
rm -f client/tsconfig.json
rm -f client/vite.config.js
rm -f client/tsconfig.node.json
rm -f server/tsconfig.json
rm -f shared/tsconfig.json

# Update root package.json
echo "Updating root package.json..."
update_file "package.json" '{
  "name": "p2p-roulette",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "client",
    "server",
    "shared"
  ],
  "scripts": {
    "start": "docker-compose up",
    "dev": "concurrently \"npm:dev:*\"",
    "dev:client": "npm run start --workspace=@p2p-roulette/client",
    "dev:server": "npm run dev --workspace=@p2p-roulette/server",
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present"
  },
  "devDependencies": {
    "@commitlint/cli": "^17.0.0",
    "@commitlint/config-conventional": "^17.0.0",
    "concurrently": "^8.2.0",
    "eslint": "^8.45.0",
    "eslint-config-prettier": "^9.0.0",
    "prettier": "^3.0.0"
  }
}'

# Update client package.json
echo "Updating client package.json..."
update_file "client/package.json" '{
  "name": "@p2p-roulette/client",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@reduxjs/toolkit": "^2.0.1",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-redux": "^9.0.4",
    "react-router-dom": "^6.21.1",
    "socket.io-client": "^4.7.2",
    "web3": "^4.3.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  },
  "proxy": "http://localhost:4000"
}'

# Update server package.json
echo "Updating server package.json..."
update_file "server/package.json" '{
  "name": "@p2p-roulette/server",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "sequelize": "^6.35.2",
    "pg": "^8.11.3",
    "redis": "^4.6.7",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "scripts": {
    "dev": "nodemon src/index.js",
    "build": "babel src -d dist",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src"
  },
  "devDependencies": {
    "@babel/cli": "^7.23.4",
    "@babel/core": "^7.23.4",
    "@babel/preset-env": "^7.23.4",
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "eslint": "^8.45.0"
  }
}'

# Update shared package.json
echo "Updating shared package.json..."
update_file "shared/package.json" '{
  "name": "@p2p-roulette/shared",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "build": "babel src -d dist",
    "test": "jest",
    "lint": "eslint src"
  },
  "devDependencies": {
    "@babel/cli": "^7.23.4",
    "@babel/core": "^7.23.4",
    "@babel/preset-env": "^7.23.4",
    "jest": "^29.7.0",
    "eslint": "^8.45.0"
  }
}'

# Update ESLint config
echo "Updating .eslintrc.js..."
update_file ".eslintrc.js" 'module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["react", "react-hooks"],
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
}'

# Update client/public/index.html
echo "Updating client/public/index.html..."
update_file "client/public/index.html" '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="P2P Roulette - Practice Currency Gaming" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>P2P Roulette</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>'

# Update client/public/manifest.json
echo "Updating client/public/manifest.json..."
update_file "client/public/manifest.json" '{
  "short_name": "P2P Roulette",
  "name": "P2P Roulette - Practice Currency Gaming",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}'

# Update client environment file
echo "Creating client/.env..."
update_file "client/.env" 'REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_SOCKET_URL=http://localhost:4000'

# Update client/src/index.js
echo "Updating client/src/index.js..."
update_file "client/src/index.js" 'import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { store } from "./store/store";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);'

# Update Docker client Dockerfile
echo "Updating docker/client/Dockerfile..."
update_file "docker/client/Dockerfile" 'FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]'

echo "Project files have been updated successfully!"