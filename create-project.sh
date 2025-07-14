#!/bin/bash

# Create client structure
mkdir -p client/{public/assets,src/{assets/{images,fonts},components/{common/{Button,Input,Modal},game/{Roulette,Bet,GameStats},layout/{Header,Footer}},hooks/__tests__,pages/{Home,Game,Profile},services/__tests__,store/{slices,__tests__},utils/__tests__}}

# Create server structure
mkdir -p server/src/{config,controllers/__tests__,models,routes/__tests__,services/__tests__,socket/__tests__,utils/__tests__}

# Create shared structure
mkdir -p shared/src/{constants,utils/__tests__}

# Create other directories
mkdir -p .github/workflows docker/{client,server,database}

# Create client files
touch client/public/{index.html,favicon.ico}

# Create component files
for component in Button Input Modal; do
    touch client/src/components/common/$component/{$component.jsx,$component.css,$component.test.jsx}
done

for component in Roulette Bet GameStats; do
    touch client/src/components/game/$component/{$component.jsx,$component.css,$component.test.jsx}
done

for component in Header Footer; do
    touch client/src/components/layout/$component/{$component.jsx,$component.css,$component.test.jsx}
done

# Create hooks files
touch client/src/hooks/{useWeb3.js,useSocket.js,useGameState.js}
touch client/src/hooks/__tests__/{useWeb3.test.js,useSocket.test.js,useGameState.test.js}

# Create pages files
for page in Home Game Profile; do
    touch client/src/pages/$page/{$page.jsx,$page.css,$page.test.jsx}
done

# Create services files
touch client/src/services/{api.js,web3.js,socket.js}
touch client/src/services/__tests__/{api.test.js,web3.test.js,socket.test.js}

# Create store files
touch client/src/store/store.js
touch client/src/store/slices/{gameSlice.js,userSlice.js,walletSlice.js}
touch client/src/store/__tests__/{gameSlice.test.js,userSlice.test.js,walletSlice.test.js}

# Create utils files
touch client/src/utils/{formatters.js,validators.js}
touch client/src/utils/__tests__/{formatters.test.js,validators.test.js}

# Create server files
touch server/src/config/{database.js,socket.js,jwt.js}
touch server/src/controllers/{gameController.js,userController.js,walletController.js}
touch server/src/controllers/__tests__/{gameController.test.js,userController.test.js,walletController.test.js}
touch server/src/models/{Game.js,User.js,Wallet.js}
touch server/src/routes/{gameRoutes.js,userRoutes.js,walletRoutes.js}
touch server/src/routes/__tests__/{gameRoutes.test.js,userRoutes.test.js,walletRoutes.test.js}
touch server/src/services/{gameService.js,userService.js,walletService.js}
touch server/src/services/__tests__/{gameService.test.js,userService.test.js,walletService.test.js}
touch server/src/socket/{gameHandler.js,chatHandler.js}
touch server/src/socket/__tests__/{gameHandler.test.js,chatHandler.test.js}
touch server/src/utils/{auth.js,validation.js}
touch server/src/utils/__tests__/{auth.test.js,validation.test.js}

# Create shared files
touch shared/src/constants/{gameConstants.js,errorCodes.js}
touch shared/src/utils/{validation.js,formatting.js}
touch shared/src/utils/__tests__/{validation.test.js,formatting.test.js}
touch shared/package.json

# Create Docker files
touch docker/{client,server,database}/Dockerfile

# Create GitHub workflow files
touch .github/workflows/{ci.yml,deploy.yml}

# Create root config files
touch {.eslintrc.js,.prettierrc,docker-compose.yml,package.json}

echo "Project structure created successfully!"