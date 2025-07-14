
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Creating App.css file...${NC}"

# Create App.css file
create_app_css() {
    echo -e "${YELLOW}Creating client/src/App.css${NC}"
    cat > "client/src/App.css" << 'EOL'
.app {
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #282c34;
}

.app-header {
  background-color: #1a1e24;
  padding: 1rem;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
}

main {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.5rem;
  }

  main {
    padding: 1rem;
  }
}
EOL

    # Update App.js if needed
    if ! grep -q "import.*App.css" "client/src/App.js"; then
        # Add import statement at the beginning of App.js
        sed -i.bak '1i\
import "./App.css";
' "client/src/App.js"
        rm "client/src/App.js.bak"
    fi
}

# Main execution
if [ -d "client/src" ]; then
    create_app_css
    echo -e "${GREEN}App.css has been created successfully!${NC}"
    echo -e "${YELLOW}The CSS file has been created and imported in App.js${NC}"
    echo -e "${YELLOW}Restart your development server to apply changes.${NC}"
else
    echo -e "${RED}Error: client/src directory not found!${NC}"
    exit 1
fi