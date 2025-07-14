
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting test file verification and creation...${NC}"

# Function to create a basic React component test
create_component_test() {
    local file=$1
    local component_name=$(basename "$file" .js)
    local test_file="${file%.*}.test.js"

    if [ ! -f "$test_file" ]; then
        echo -e "${YELLOW}Creating test for $component_name${NC}"
        cat > "$test_file" << EOL
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../store';
import $component_name from './$component_name';

describe('$component_name', () => {
  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <$component_name />
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders without crashing', () => {
    expect(() => renderComponent()).not.toThrow();
  });
});
EOL
    fi
}

# Function to create a basic hook test
create_hook_test() {
    local file=$1
    local hook_name=$(basename "$file" .js)
    local test_file="${file%.*}.test.js"

    if [ ! -f "$test_file" ]; then
        echo -e "${YELLOW}Creating test for $hook_name${NC}"
        cat > "$test_file" << EOL
import { renderHook } from '@testing-library/react';
import $hook_name from './$hook_name';

describe('$hook_name', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => $hook_name());
    expect(result.current).toBeDefined();
  });
});
EOL
    fi
}

# Function to create a basic service test
create_service_test() {
    local file=$1
    local service_name=$(basename "$file" .js)
    local test_file="${file%.*}.test.js"

    if [ ! -f "$test_file" ]; then
        echo -e "${YELLOW}Creating test for $service_name${NC}"
        cat > "$test_file" << EOL
import $service_name from './$service_name';

describe('$service_name', () => {
  it('should be defined', () => {
    expect($service_name).toBeDefined();
  });
});
EOL
    fi
}

# Function to create a basic util test
create_util_test() {
    local file=$1
    local util_name=$(basename "$file" .js)
    local test_file="${file%.*}.test.js"

    if [ ! -f "$test_file" ]; then
        echo -e "${YELLOW}Creating test for $util_name${NC}"
        cat > "$test_file" << EOL
import * as $util_name from './$util_name';

describe('$util_name', () => {
  it('should export required functions', () => {
    expect($util_name).toBeDefined();
  });
});
EOL
    fi
}

# Function to create a basic store slice test
create_store_test() {
    local file=$1
    local slice_name=$(basename "$file" .js)
    local test_file="${file%.*}.test.js"

    if [ ! -f "$test_file" ]; then
        echo -e "${YELLOW}Creating test for $slice_name${NC}"
        cat > "$test_file" << EOL
import reducer, { actions } from './$slice_name';

describe('$slice_name reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({});
  });
});
EOL
    fi
}

# Main execution
cd client/src

# Process components
echo -e "${YELLOW}Processing components...${NC}"
find ./components -name "*.js" ! -name "*.test.js" | while read -r file; do
    if [[ -f "$file" ]]; then
        create_component_test "$file"
    fi
done

# Process hooks
echo -e "${YELLOW}Processing hooks...${NC}"
find ./hooks -name "*.js" ! -name "*.test.js" | while read -r file; do
    if [[ -f "$file" ]]; then
        create_hook_test "$file"
    fi
done

# Process services
echo -e "${YELLOW}Processing services...${NC}"
find ./services -name "*.js" ! -name "*.test.js" | while read -r file; do
    if [[ -f "$file" ]]; then
        create_service_test "$file"
    fi
done

# Process utils
echo -e "${YELLOW}Processing utils...${NC}"
find ./utils -name "*.js" ! -name "*.test.js" | while read -r file; do
    if [[ -f "$file" ]]; then
        create_util_test "$file"
    fi
done

# Process store
echo -e "${YELLOW}Processing store...${NC}"
find ./store -name "*.js" ! -name "*.test.js" ! -name "index.js" | while read -r file; do
    if [[ -f "$file" ]]; then
        create_store_test "$file"
    fi
done

echo -e "${GREEN}Test file creation completed!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Run tests with: ${GREEN}npm test --workspace=client${NC}"
echo -e "2. Update the generated test files with meaningful test cases"
echo -e "3. Ensure test coverage with: ${GREEN}npm test --workspace=client -- --coverage${NC}"