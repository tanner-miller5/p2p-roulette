# P2P Roulette Project Overview

## Introduction
A peer-to-peer roulette game using practice currency where players can bet against each other in a fair and transparent environment.

## Currency System

### Practice Token System (RLT)
- **Roulette Token (RLT)**
  - Free practice currency
  - No real-world value
  - Cannot be exchanged for real money or crypto
  - Used for entertainment only

- **RLT Features**
  - Daily bonus: 1,000 RLT
  - Starting balance: 1,000 RLT
  - Maximum balance: 10,000 RLT
  - Persistent local storage

## Game Mechanics

### P2P Betting System
1. **Player Pool**
   - Players bet against each other
   - Minimum two players required to start a round
   - House doesn't participate in bets
   - Winnings come from other players' losses
   - Dynamic odds based on bet distribution
   - Unmatched bets are automatically refunded

2. **Bet Matching System**
   - First-in-first-matched (FIFO) queue for each color
   - Bets are matched in order of placement
   - Larger bets can be matched against multiple smaller bets
   - Smaller bets can be combined to match larger bets
   - Partial matches are allowed
   - Real-time matching display
   - Example scenarios:
     * If Player A bets 100 on red, it needs equivalent black bets to match
     * A 100 red bet can match with two 50 black bets
     * A 50 black bet can partially match a 100 red bet
     * Unmatched portions are refunded

3. **Betting Pool**
   - Matched bets form the active pool
   - Unmatched bets remain in queue until:
     * Matching bets are placed
     * Betting window ends (resulting in refund)
   - Real-time pool balance display
   - Separate queues for red and black bets
   - Transparent matching process

4. **House Revenue**
   - 2.5% transaction fee from winning bets only
   - No fees charged on refunded or unmatched bets
   - Ad revenue share system
   - No house edge on bets
   - Transparent fee structure

5. **Round Structure**
   - 30-second betting window
   - Continuous bet matching during window
   - Unmatched bet refund processing (2 seconds)
   - 10-second spin animation
   - 5-second result display
   - Automatic round progression

### Bet Types

1. **Color Bets**
   - Red/Black only betting system
   - Equal odds for both colors
   - Dynamic payout ratios based on bet distribution
   - Balanced pool management
   - Risk distribution between colors
   - Pure player vs player betting
   - No green numbers or zero
   - 50/50 chance for each color

### Advertising System

#### Ad Integration
1. **Display Locations**
   - Between rounds (5 seconds)
   - Side panel ads
   - Background sponsorships
   - Profile customization

2. **Ad Types**
   - Video ads (5-15 seconds)
   - Banner advertisements
   - Sponsored themes
   - Interactive promotions

3. **Revenue Distribution**
   - 70% to platform
   - 20% to active players
   - 10% to liquidity providers
   - Monthly distribution

#### Ad Management
1. **Player Rewards**
   - Ad view credits
   - Daily watch limits
   - Reward multipliers
   - Special promotions

2. **Advertiser Dashboard**
   - Real-time analytics
   - Audience targeting
   - Performance metrics
   - Budget management

### Payout System

#### Pool Distribution
1. **Betting Validation and Matching**
   - Real-time matching system using FIFO
   - Automatic splitting of larger bets if needed
   - Combination of smaller bets when required
   - Tracking of partial matches
   - Clear display of matched and unmatched amounts

2. **Match Processing**
   - Queue position timestamp
   - Match verification
   - Partial match calculations
   - Unmatched amount tracking
   - Real-time match updates

3. **Winning Calculation**
   - Total matched pool collection
   - Fee deduction (2.5%)
   - Winner identification
   - Proportional distribution based on matched amounts

4. **Transaction Flow**
   - Refund processing for unmatched bets
   - Instant settlements for matched bets
   - Fee processing on winning bets
   - Winner payouts

#### Revenue Streams
1. **Platform Fees**
   - 2.5% of winning bets
   - Ad revenue (70%)
   - Sponsored content
   - Premium features

2. **Player Benefits**
   - Ad revenue share (20%)
   - Loyalty rewards
   - Tournament prizes
   - Referral bonuses

### Network Architecture

1. **Real-time Connectivity**
   - WebSocket-based communication
   - Socket.io implementation
   - Persistent connections
   - Auto-reconnection handling
   - Real-time state synchronization
   - Low latency updates

2. **Game Rooms**
   - Single global room for all players
   - Automatic room joining on connection
   - Real-time player count updates
   - Synchronized game state
   - Shared betting pool visibility
   - Common timer for all players

3. **State Management**
   - Centralized game state
   - Real-time bet synchronization
   - Player connection status tracking
   - Automatic disconnect handling
   - Session persistence
   - State recovery on reconnection

4. **Connection Security**
   - Encrypted WebSocket connections
   - JWT authentication
   - Rate limiting
   - Connection validation
   - Anti-cheat measures
   - Secure state transmission

### Game Flow

1. **Connection Phase**
   - Player connects to WebSocket server
   - Authentication verification
   - Room assignment
   - State synchronization
   - Current round status update
   - Player count verification

2. **Pre-Round**
   - Player count verification (minimum 2 players)
   - Pool formation for red and black bets
   - Bet placement on chosen color
   - Ad display
   - Timer countdown
   - Round cancellation if minimum players not met

3. **During Round**
   - Real-time bet updates to all players
   - Spin animation synchronization
   - Live bet display
   - Pool size update
   - Player count

4. **Post-Round**
   - Result display
   - Payout calculation
   - Fee processing
   - Next round prep

5. **Failover Handling**
   - Connection loss detection
   - Automatic reconnection attempts
   - State recovery
   - Bet preservation
   - Session restoration
   - Missed round compensation

## Technical Implementation

### P2P System
1. **Pool Management**
   - Real-time updates
   - Balance verification
   - Transaction logging

2. **Ad Integration**
   - Ad server connection
   - Player tracking
   - Revenue distribution
   - Performance monitoring

### Currency Management
- **RLT Management**
  - Local storage system
  - Daily bonus tracking
  - Balance limitations
  - Reset capabilities

### Technical Architecture

1. **Server Infrastructure**
   - Node.js backend
   - Socket.io server
   - Express.js REST API
   - Redis for state management
   - PostgreSQL for persistent data
   - Load balancer for scaling

2. **Client Architecture**
   - React frontend
   - Socket.io client
   - State management with Redux
   - Real-time updates
   - Offline detection
   - Reconnection handling

3. **Communication Protocol**
   - WebSocket events for real-time data
   - REST API for static data
   - Binary data optimization
   - Compressed state updates
   - Minimal payload size
   - Event-driven architecture

4. **Scaling Considerations**
   - Horizontal scaling capability
   - Multiple game instances
   - Distributed state management
   - Load distribution
   - Connection pooling
   - Regional server support

### User Interface

1. **Game Layout**
   - **Top Bar**
     * Connection status indicator
     * Current player count
     * Personal wallet balance
     * Settings menu
     * Sound toggle

   - **Main Game Area**
     * Large centered roulette wheel
     * Current round timer
     * Previous results history (last 10 spins)
     * Color streak display

   - **Betting Interface**
     * Two prominent betting sections (Red/Black)
     * Bet amount input field
     * Quick bet amount buttons (10, 50, 100, 500)
     * Clear bet button
     * Current odds display
     * Potential winnings calculator

   - **Match Queue Display**
     * Current queue position
     * Matched amount progress bar
     * Unmatched amount indicator
     * Total pool size per color
     * Match rate indicator

2. **Statistics Panel**
   - Color distribution chart
   - Personal win/loss record
   - Current session statistics
   - Highest win amount
   - Current winning streak
   - Collapsible detailed stats

3. **Responsive Design**
   - **Desktop Layout**
     * Full-width game view
     * Side panel for statistics
     * Multi-column bet history
     * Expanded statistics view

   - **Mobile Layout**
     * Stack layout for components
     * Bottom navigation bar
     * Swipeable panels
     * Simplified betting interface
     * Collapsible sections

4. **Animations and Effects**
   - Smooth wheel rotation
   - Bet placement feedback
   - Win/loss celebrations
   - Match confirmation effects
   - Color transition effects
   - Loading spinners

5. **Notifications**
   - **In-game Alerts**
     * Bet matched notification
     * Round start countdown
     * Win/loss results
     * Connection status changes
     * Error messages

   - **Toast Messages**
     * Successful bet placement
     * Refund notifications
     * System announcements
     * Match updates

6. **Theme and Styling**
   - **Color Scheme**
     * Dark mode background (#121212)
     * Red betting section (#D32F2F)
     * Black betting section (#212121)
     * Accent color (#FFD700)
     * Text colors
       - Primary (#FFFFFF)
       - Secondary (#AAAAAA)

   - **Typography**
     * Primary font: 'Inter'
     * Numbers font: 'Roboto Mono'
     * Clear hierarchy
       - Headings: 24px
       - Subheadings: 18px
       - Body text: 16px
       - Small text: 14px

7. **Interactive Elements**
   - **Buttons**
     * Raised design for primary actions
     * Outlined style for secondary actions
     * Hover effects
     * Active state indicators
     * Disabled state styling

   - **Input Fields**
     * Clear visual feedback
     * Error state handling
     * Input validation
     * Auto-formatting
     * Placeholder text

8. **Loading States**
   - Initial load spinner
   - Bet processing indicator
   - Match queue updates
   - Transaction processing
   - Reconnecting animation

9. **Error Handling**
    - Clear error messages
    - Retry options
    - Fallback UI
    - Offline mode
    - Recovery instructions

10. **Accessibility**
    - High contrast mode
    - Screen reader support
    - Keyboard navigation
    - Focus indicators
    - ARIA labels
    - Color blind friendly

## Security Features

### Practice Mode Security
- Local data persistence
- Balance limit enforcement
- Anti-tampering measures
- Session management

## Player Experience

### Account Management

- **Practice Mode**
  - Free RLT distribution
  - Daily bonus system
  - Progress tracking
  - No registration required

### Game Features
- Simple red/black betting interface
- Real-time animations
- Result history
- Statistics tracking
- Color streak tracking
- Even odds betting system

## Future Enhancements

### Planned Features
1. Tournament mode with RLT
2. Social sharing capabilities
3. Achievement system
4. Enhanced animations
5. Mobile optimization

### Technical Improvements
1. Performance optimization
2. Enhanced user interface
3. Advanced statistics

## Documentation

### Player Guidelines

- **RLT System**
  - Practice mode tutorial
  - Daily bonus guide
  - Balance management
  - Game rules

### Technical Documentation
- API documentation
- Integration guides
- Security protocols
- Deployment procedures

## Compliance

### Practice Mode
- Fair play policies
- Terms of service
- Privacy protection
- Data handling

## Usage Statistics

### Tracking Metrics
- Player engagement
- Currency preferences
- Betting patterns
- Win/loss ratios

### Analysis Tools
- Performance monitoring
- User behavior analysis
- System optimization
- Feature utilization

## Maintenance

### Regular Updates
- Security patches
- Feature additions
- Bug fixes
- Performance optimization

### System Monitoring
- Uptime tracking
- Error logging
- Performance metrics
- User feedback

## Technical Requirements

### Frontend
- React 19.1.0
- Local storage
- Responsive design

### Network
- Data synchronization
- Real-time updates
- Secure connections

## Support

### Player Assistance
- Game tutorials
- Currency guides
- FAQ section
- Support channels

### Technical Support
- Integration help
- Documentation access
- Issue resolution
- Update guidance

## Revenue Model

### Platform Income
1. **Transaction Fees**
   - 2.5% of winning bets
   - Instant processing
   - Transparent tracking
   - Automated collection

2. **Advertising Revenue**
   - Display ad income
   - Sponsored content
   - Premium placements
   - Partnership deals

### Revenue Distribution
1. **Platform Share**
   - 70% of ad revenue
   - 2.5% transaction fees
   - Sponsored content
   - Premium features

2. **Player Benefits**
   - 20% ad revenue share
   - Loyalty rewards
   - Tournament prizes
   - Special promotions

3. **Ecosystem Support**
   - 10% to liquidity
   - System maintenance
   - Development
   - Security

## Payout Structure

### Pool Management
1. **Bet Collection**
   - Player deposits
   - Pool formation
   - Balance tracking
   - Round management

2. **Payout Processing**
   - Winner identification
   - Fee calculation
   - Revenue distribution
   - Transaction execution

### Revenue Distribution
1. **Fee Processing**
   - 2.5% collection
   - Ad revenue share
   - Automated distribution
   - Transaction verification

2. **Player Rewards**
   - Ad view tracking
   - Revenue sharing
   - Bonus distribution
   - Balance updates

### Implementation Requirements

1. **Frontend Development**
   - **Core Technologies**
     * React 19.1.0 for UI components
     * React Scripts 5.0.1 for build tooling
     * CSS3 for styling
     * Socket.io-client 4.7.2 for real-time connections
     * React Router DOM 6.15.0 for routing

   - **State Management**
     * Redux for global state
     * React hooks for local state
     * Socket event handlers
     * Game state synchronization
     * Token balance management
     * Practice currency transactions

   - **Game Currency System**
     * Daily free token allowance
     * Token balance tracking
     * Practice currency only
     * No real money integration
     * Virtual token transactions
     * Token history tracking

   - **Testing Setup**
     * Jest 29.6.2 for unit testing
     * React Testing Library
     * E2E testing with Cypress
     * Socket event mocking
     * Game token transaction testing

2. **Backend Infrastructure**
   - **Core Technologies**
     * Node.js with Express 4.18.2
     * Socket.io 4.7.2 for WebSocket
     * PostgreSQL 8.11.3 with Sequelize 6.32.1
     * Redis 4.6.7 for caching
     * JSON Web Tokens (jwt 9.0.1)

   - **API Structure**
     * RESTful endpoints for static data
     * WebSocket events for real-time updates
     * Authentication middleware
     * Rate limiting
     * Input validation
     * Error handling middleware

   - **Database Schema**
     * Users table
     * Practice token balances
     * Game history
     * Betting records
     * Game rounds
     * Match queue

3. **Game Token System**
   - **Features**
     * Free daily token rewards
     * Token balance system
     * Practice betting limits
     * Token transaction history
     * Achievement rewards
     * Bonus tokens for activities

   - **Token Management**
     * Starting balance for new users
     * Daily login rewards
     * Win/loss tracking
     * Token transfer validation
     * Balance updates
     * History logging

4. **Development Workflow**
   - **Code Quality**
     * ESLint 8.45.0 configuration
       - Airbnb style guide base
       - React-specific rules
       - Custom rule overrides
       - Auto-fix on save
       - Integration with IDE

     * Prettier 3.0.0 setup
       - Standard configuration
       - Pre-commit formatting
       - Editor integration
       - Ignore patterns
       - Custom rules for CSS/HTML

     * Commit Standards
       - Conventional commits
       - Semantic versioning
       - Change documentation
       - Issue references
       - Breaking change markers

     * Code Review Process
       - Pull request templates
       - Required reviewers
       - Review checklist
       - Merge criteria
       - Documentation updates

   - **Branch Strategy**
     * Main Branches
       - main: production-ready code
       - develop: integration branch
       - staging: pre-production testing

     * Feature Branches
       - feature/[ticket-number]-description
       - bugfix/[ticket-number]-description
       - hotfix/[ticket-number]-description
       - release/v[version]

     * Protection Rules
       - Required reviews
       - Build checks
       - Test coverage
       - No direct commits to main
       - Linear history

   - **Testing Strategy**
     * Unit Testing
       - Jest configuration
       - Component testing
       - Service testing
       - Mocking strategy
       - Coverage requirements (80%)

     * Integration Testing
       - API endpoints
       - WebSocket events
       - Database operations
       - Cache interactions
       - Service integration

     * End-to-End Testing
       - Critical user paths
       - Game flow testing
       - Token transactions
       - Error scenarios
       - Performance testing

   - **CI/CD Pipeline**
     * GitHub Actions Workflow
       - Build validation
       - Test execution
       - Linting checks
       - Security scanning
       - Docker image creation

     * Deployment Stages
       - Development deployment
       - Staging deployment
       - Production deployment
       - Rollback procedures
       - Health checks

     * Environment Management
       - Environment variables
       - Secrets handling
       - Configuration files
       - Feature flags
       - API keys

   - **Documentation**
     * Code Documentation
       - JSDoc comments
       - README files
       - API documentation
       - Component documentation
       - Architecture diagrams

     * Process Documentation
       - Setup guides
       - Contribution guidelines
       - Testing procedures
       - Deployment process
       - Troubleshooting guides

   - **Development Environment**
     * Local Setup
       - Node.js configuration
       - Database setup
       - Redis instance
       - Environment variables
       - SSL certificates

     * IDE Configuration
       - ESLint integration
       - Prettier integration
       - Debug configurations
       - Git integration
       - Code snippets

     * Docker Development
       - Development containers
       - Service composition
       - Volume mapping
       - Network setup
       - Hot reload

   - **Quality Assurance**
     * Code Quality Metrics
       - Complexity analysis
       - Dependency scanning
       - Dead code detection
       - Bundle size monitoring
       - Performance metrics

     * Automated Checks
       - Security vulnerabilities
       - Dependency updates
       - Code duplication
       - Memory leaks
       - API contract testing

     * Performance Monitoring
       - Load testing
       - Response times
       - Resource usage
       - Error rates
       - User metrics

   - **Release Management**
     * Version Control
       - Semantic versioning
       - Change logs
       - Release notes
       - Tag management
       - Version artifacts

     * Release Process
       - Feature freeze
       - Release branch
       - Testing cycle
       - Documentation update
       - Deployment schedule

     * Monitoring
       - Error tracking
       - Performance metrics
       - User feedback
       - System health
       - Usage analytics

5. **Environment Configuration**
   - **Development Environment**
     * Local Setup
       - Node.js v18+ configuration
       - NPM workspace setup
       - Git hooks configuration
       - Local SSL certificates
       - Development proxy settings

     * Database Configuration
       - PostgreSQL setup
       - Connection pooling
       - Test database
       - Migration scripts
       - Seed data scripts
       - Backup procedures

     * Redis Setup
       - Local Redis instance
       - Cache configuration
       - Session storage
       - Rate limiting setup
       - Pub/Sub channels

     * Environment Variables
       - `.env.development`
       - `.env.test`
       - `.env.example`
       - Secret management
       - API keys storage

     * Docker Development
       - Docker Compose setup
       - Service definitions
       - Volume management
       - Network configuration
       - Hot reload setup

   - **Testing Environment**
     * Test Configuration
       - Jest setup
       - Test database
       - Mock services
       - WebSocket mocks
       - Coverage reports

     * Testing Tools
       - Browser testing
       - API testing
       - Load testing
       - Security testing
       - Integration testing

     * CI Environment
       - GitHub Actions setup
       - Test runners
       - Environment variables
       - Cache configuration
       - Artifact storage

   - **Staging Environment**
     * Infrastructure
       - Cloud provider setup
       - Container orchestration
       - Load balancing
       - Auto-scaling rules
       - Network security

     * Monitoring
       - Error tracking
       - Performance metrics
       - Log aggregation
       - Alert configuration
       - User analytics

     * Data Management
       - Database backups
       - Data sanitization
       - Restore procedures
       - Archive policies
       - Cleanup scripts

   - **Production Environment**
     * Server Requirements
       - Hardware specifications
       - OS configuration
       - Network setup
       - Security patches
       - Backup systems

     * Security Configuration
       - SSL/TLS setup
       - Firewall rules
       - DDoS protection
       - WAF configuration
       - Access control

     * High Availability
       - Load balancing
       - Failover setup
       - Database replication
       - Cache distribution
       - Backup servers

     * Monitoring Systems
       - Application monitoring
       - Server monitoring
       - Database monitoring
       - Network monitoring
       - Security monitoring

     * Logging Setup
       - Centralized logging
       - Log rotation
       - Error tracking
       - Audit trails
       - Performance logs

   - **Deployment Configuration**
     * Deployment Process
       - Build pipeline
       - Deployment scripts
       - Rollback procedures
       - Health checks
       - Smoke tests

     * Container Orchestration
       - Container registry
       - Deployment strategy
       - Service discovery
       - Resource limits
       - Scaling policies

     * Configuration Management
       - Config versioning
       - Environment syncing
       - Secret rotation
       - Feature flags
       - API versioning

   - **Backup and Recovery**
     * Backup Strategy
       - Database backups
       - File system backups
       - Configuration backups
       - Schedule management
       - Retention policies

     * Recovery Procedures
       - Disaster recovery
       - Data restoration
       - Service recovery
       - Incident response
       - Communication plan

   - **Performance Optimization**
     * Caching Strategy
       - Redis configuration
       - Browser caching
       - API caching
       - Static assets
       - Query caching

     * Resource Management
       - Memory limits
       - CPU allocation
       - Disk space
       - Network bandwidth
       - Connection pools

   - **Security Measures**
     * Access Control
       - User authentication
       - Role management
       - API authentication
       - Session management
       - Token handling

     * Data Protection
       - Encryption at rest
       - Transport security
       - Data masking
       - PII handling
       - Audit logging

   - **Documentation**
     * Setup Documentation
       - Installation guides
       - Configuration guides
       - Troubleshooting
       - Best practices
       - FAQ section

     * Operation Manuals
       - Deployment procedures
       - Monitoring guides
       - Backup procedures
       - Recovery plans
       - Maintenance tasks

6. **Security Measures**
   - **Implementation**
     * Rate limiting
     * Input validation
     * SQL injection prevention
     * XSS protection
     * CSRF tokens
     * Security headers

   - **Game Token Security**
     * Token transaction validation
     * Anti-cheating measures
     * Balance verification
     * Transaction logging
     * Rate limiting on rewards
     * Activity monitoring

7. **Performance Optimization**
   - **Frontend Optimization**
     * Bundle Optimization
       - Code splitting by route
       - Dynamic imports
       - Tree shaking
       - Lazy loading components
       - Bundle size analysis
       - Module concatenation

     * Asset Management
       - Image optimization
       - Font loading strategy
       - SVG sprite sheets
       - Resource hints
       - Asset compression
       - CDN integration

     * React Performance
       - Component memoization
       - Virtual DOM optimization
       - Render optimization
       - Hook optimization
       - Context optimization
       - Event handler cleanup

     * State Management
       - Redux store optimization
       - Selector memoization
       - Action batching
       - State normalization
       - Middleware optimization
       - Subscription management

   - **Network Optimization**
     * API Efficiency
       - Request batching
       - GraphQL implementation
       - Response compression
       - Cache-Control headers
       - HTTP/2 multiplexing
       - Connection pooling

     * WebSocket Management
       - Connection throttling
       - Message batching
       - Heartbeat optimization
       - Reconnection strategy
       - Binary protocols
       - Event buffering

     * Caching Strategy
       - Browser caching
       - Service Worker cache
       - API response cache
       - Static asset cache
       - Memory cache
       - Distributed caching

   - **Backend Performance**
     * Database Optimization
       - Query optimization
       - Index management
       - Connection pooling
       - Query caching
       - Batch processing
       - Partition strategy

     * Memory Management
       - Cache eviction policies
       - Memory leak prevention
       - Garbage collection
       - Buffer management
       - Session storage
       - Resource pooling

     * Request Processing
       - Request queuing
       - Rate limiting
       - Load balancing
       - Request prioritization
       - Timeout handling
       - Error handling

   - **Real-time Game Optimization**
     * Game State Management
       - State synchronization
       - Delta updates
       - State prediction
       - Conflict resolution
       - Event batching
       - State compression

     * Animation Performance
       - RAF optimization
       - CSS transitions
       - Hardware acceleration
       - Animation throttling
       - Frame rate control
       - Memory management

     * Betting System
       - Transaction batching
       - Balance caching
       - Update throttling
       - Queue optimization
       - Match processing
       - Result calculation

   - **Resource Management**
     * CPU Optimization
       - Worker threads
       - Task scheduling
       - Process management
       - Computation batching
       - Async operations
       - Thread pooling

     * Memory Usage
       - Memory profiling
       - Leak detection
       - Cache management
       - Buffer pooling
       - Resource cleanup
       - Heap optimization

     * Disk I/O
       - File caching
       - Write batching
       - Read optimization
       - Stream management
       - Backup scheduling
       - Log rotation

   - **Monitoring and Metrics**
     * Performance Tracking
       - Response time monitoring
       - Resource usage tracking
       - Error rate monitoring
       - User metrics
       - System metrics
       - Custom events

     * Real-time Analytics
       - User behavior
       - Game statistics
       - System health
       - Network status
       - Resource utilization
       - Performance bottlenecks

     * Alerting System
       - Performance thresholds
       - Error triggers
       - Resource alerts
       - Usage warnings
       - System notifications
       - Incident reporting

   - **Load Testing**
     * Performance Testing
       - Load tests
       - Stress tests
       - Endurance tests
       - Spike tests
       - Scalability tests
       - Bottleneck identification

     * Test Scenarios
       - Concurrent users
       - Game sessions
       - Betting operations
       - Real-time updates
       - State synchronization
       - Recovery scenarios

   - **Optimization Tools**
     * Development Tools
       - Chrome DevTools
       - React DevTools
       - Redux DevTools
       - Network analyzers
       - Memory profilers
       - Performance monitors

     * Production Monitoring
       - APM solutions
       - Error tracking
       - Performance tracking
       - User monitoring
       - System monitoring
       - Log analysis

   - **Documentation**
     * Performance Guidelines
       - Best practices
       - Optimization techniques
       - Common pitfalls
       - Monitoring guides
       - Troubleshooting
       - Maintenance procedures

     * Benchmarks
       - Performance baselines
       - KPI targets
       - Response times
       - Resource usage
       - Scalability metrics
       - Quality thresholds

8. **Monitoring and Logging**
   - **Systems**
     * Error tracking
     * Performance monitoring
     * User analytics
     * System metrics
     * Token transaction logging
     * Security alerts

   - **Metrics**
     * Response times
     * Socket latency
     * Game completion rate
     * System uptime
     * Resource usage
     * Error rates

9. **Documentation Requirements**
   - **Technical Docs**
     * API documentation
     * WebSocket events
     * Database schema
     * Component hierarchy
     * State management
     * Testing guide

   - **Game Rules**
     * Practice currency explanation
     * Token earning methods
     * Betting limits
     * Daily rewards system
     * Fair play policy
     * Terms of service

10. **Disclaimer Requirements**
    - Clear indication of practice currency
    - No real money involvement
    - Educational purpose statement
    - Responsible gaming message
    - Age restriction notice
    - Terms of use

## Project Structure

### Workspace Organization
p2p-roulette/
├── client/                    # Frontend application
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── assets/
│   └── src/
│       ├── assets/
│       │   ├── images/
│       │   └── fonts/
│       ├── components/
│       │   ├── common/
│       │   │   ├── Button/
│       │   │   │   ├── Button.jsx
│       │   │   │   ├── Button.css
│       │   │   │   └── Button.test.jsx
│       │   │   ├── Input/
│       │   │   │   ├── Input.jsx
│       │   │   │   ├── Input.css
│       │   │   │   └── Input.test.jsx
│       │   │   └── Modal/
│       │   │       ├── Modal.jsx
│       │   │       ├── Modal.css
│       │   │       └── Modal.test.jsx
│       │   ├── game/
│       │   │   ├── Roulette/
│       │   │   │   ├── Roulette.jsx
│       │   │   │   ├── Roulette.css
│       │   │   │   └── Roulette.test.jsx
│       │   │   ├── Bet/
│       │   │   │   ├── Bet.jsx
│       │   │   │   ├── Bet.css
│       │   │   │   └── Bet.test.jsx
│       │   │   └── GameStats/
│       │   │       ├── GameStats.jsx
│       │   │       ├── GameStats.css
│       │   │       └── GameStats.test.jsx
│       │   └── layout/
│       │       ├── Header/
│       │       │   ├── Header.jsx
│       │       │   ├── Header.css
│       │       │   └── Header.test.jsx
│       │       └── Footer/
│       │           ├── Footer.jsx
│       │           ├── Footer.css
│       │           └── Footer.test.jsx
│       ├── hooks/
│       │   ├── useSocket.js
│       │   ├── useGameState.js
│       │   └── __tests__/
│       │       ├── useSocket.test.js
│       │       └── useGameState.test.js
│       ├── pages/
│       │   ├── Home/
│       │   │   ├── Home.jsx
│       │   │   ├── Home.css
│       │   │   └── Home.test.jsx
│       │   ├── Game/
│       │   │   ├── Game.jsx
│       │   │   ├── Game.css
│       │   │   └── Game.test.jsx
│       │   └── Profile/
│       │       ├── Profile.jsx
│       │       ├── Profile.css
│       │       └── Profile.test.jsx
│       ├── services/
│       │   ├── api.js
│       │   ├── socket.js
│       │   └── __tests__/
│       │       ├── api.test.js
│       │       └── socket.test.js
│       ├── store/
│       │   ├── slices/
│       │   │   ├── gameSlice.js
│       │   │   ├── userSlice.js
│       │   │   └── walletSlice.js
│       │   ├── store.js
│       │   └── __tests__/
│       │       ├── gameSlice.test.js
│       │       ├── userSlice.test.js
│       │       └── walletSlice.test.js
│       └── utils/
│           ├── formatters.js
│           ├── validators.js
│           └── __tests__/
│               ├── formatters.test.js
│               └── validators.test.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── socket.js
│   │   │   └── jwt.js
│   │   ├── controllers/
│   │   │   ├── gameController.js
│   │   │   ├── userController.js
│   │   │   ├── walletController.js
│   │   │   └── __tests__/
│   │   │       ├── gameController.test.js
│   │   │       ├── userController.test.js
│   │   │       └── walletController.test.js
│   │   ├── models/
│   │   │   ├── Game.js
│   │   │   ├── User.js
│   │   │   └── Wallet.js
│   │   ├── routes/
│   │   │   ├── gameRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── walletRoutes.js
│   │   │   └── __tests__/
│   │   │       ├── gameRoutes.test.js
│   │   │       ├── userRoutes.test.js
│   │   │       └── walletRoutes.test.js
│   │   ├── services/
│   │   │   ├── gameService.js
│   │   │   ├── userService.js
│   │   │   ├── walletService.js
│   │   │   └── __tests__/
│   │   │       ├── gameService.test.js
│   │   │       ├── userService.test.js
│   │   │       └── walletService.test.js
│   │   ├── socket/
│   │   │   ├── gameHandler.js
│   │   │   ├── chatHandler.js
│   │   │   └── __tests__/
│   │   │       ├── gameHandler.test.js
│   │   │       └── chatHandler.test.js
│   │   └── utils/
│   │       ├── auth.js
│   │       ├── validation.js
│   │       └── __tests__/
│   │           ├── auth.test.js
│   │           └── validation.test.js
├── shared/
│   ├── src/
│   │   ├── constants/
│   │   │   ├── gameConstants.js
│   │   │   └── errorCodes.js
│   │   └── utils/
│   │       ├── validation.js
│   │       ├── formatting.js
│   │       └── __tests__/
│   │           ├── validation.test.js
│   │           └── formatting.test.js
│   └── package.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docker/
│   ├── client/
│   │   └── Dockerfile
│   ├── server/
│   │   └── Dockerfile
│   └── database/
│       └── Dockerfile
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
└── package.json


The updated structure includes:
- Detailed component organization with their respective test files
- Comprehensive testing structure for all layers (unit, integration, e2e)
- Clear separation of concerns between client and server
- Shared utilities and constants
- Complete CI/CD pipeline configuration
- Docker setup for all services

Each component and service follows the pattern:
- Implementation file (`.jsx` or `.js`)
- Style file (`.css`) for components
- Test file (`.test.jsx` or `.test.js`)

The test structure is organized in three levels:
1. Unit tests (alongside the implementation files)
2. Integration tests (in dedicated `/integration` folders)
3. End-to-end tests (in dedicated `/e2e` folders)


### Key Configuration Files

1. **Root Level**
   - `package.json`: Workspace configuration and shared dependencies
   - `docker-compose.yml`: Multi-container Docker configuration
   - `.eslintrc.js`: ESLint rules and plugins
   - `.prettierrc`: Code formatting rules

2. **Client Package**
   - `client/package.json`: Frontend dependencies
   - `client/.env`: Frontend environment variables

3. **Server Package**
   - `server/package.json`: Backend dependencies
   - `server/.env`: Backend environment variables

4. **Shared Package**
   - `shared/package.json`: Shared dependencies

### Workspace Dependencies

1. **Development Tools**
   - ESLint 8.45.0
   - Prettier 3.0.0

2. **Client Dependencies**
   - React 19.1.0
   - React Router DOM 6.15.0
   - Socket.io-client 4.7.2

3. **Server Dependencies**
   - Express 4.18.2
   - Socket.io 4.7.2
   - PostgreSQL 8.11.3
   - JWT 9.0.1

4. **Testing Framework**
   - Jest 29.6.2
   - Supertest 6.3.3
   - Testing Library

### Development Workflow

1. **Local Development**
   ```bash
   npm install        # Install all dependencies
   npm run dev       # Start development servers
   ```

2. **Testing**
   ```bash
   npm run test      # Run all tests
   npm run lint      # Check code style
   ```

3. **Production Build**
   ```bash
   npm run build     # Build all packages
   npm start         # Start production containers
   ```

This structure enables:
- Monorepo workspace management
- Shared code between packages
- Consistent development experience
- Docker-based deployment
- Automated testing and linting
- Efficient code organization
- Component-based styling

## State Machine

### Game State Machine Table

| Current State | Event | Next State | Actions |
|--------------|-------|------------|----------|
| INITIALIZING | CONNECTION_ESTABLISHED | WAITING_FOR_PLAYERS | - Initialize game room<br>- Sync game state<br>- Update player count |
| WAITING_FOR_PLAYERS | MIN_PLAYERS_REACHED | BETTING_OPEN | - Start betting window<br>- Initialize betting pools<br>- Start 30s timer |
| WAITING_FOR_PLAYERS | PLAYER_DISCONNECTED | WAITING_FOR_PLAYERS | - Update player count<br>- Check minimum players |
| BETTING_OPEN | BET_PLACED | BETTING_OPEN | - Process bet<br>- Update pools<br>- Match bets<br>- Update UI |
| BETTING_OPEN | BETTING_WINDOW_CLOSED | PROCESSING_BETS | - Close betting<br>- Process final matches<br>- Prepare refunds |
| PROCESSING_BETS | BETS_PROCESSED | SPINNING | - Start wheel animation<br>- Broadcast spin start<br>- Start 10s timer |
| SPINNING | SPIN_COMPLETED | RESULTS | - Calculate winners<br>- Process payouts<br>- Update balances<br>- Start 5s timer |
| RESULTS | DISPLAY_TIMEOUT | CLEANUP | - Process fees<br>- Update statistics<br>- Clear game state |
| CLEANUP | CLEANUP_COMPLETED | WAITING_FOR_PLAYERS | - Reset pools<br>- Clear bets<br>- Prepare next round |
| ANY_STATE | ERROR_OCCURRED | ERROR | - Log error<br>- Notify players<br>- Attempt recovery |
| ERROR | RECOVERY_SUCCESS | WAITING_FOR_PLAYERS | - Reset game state<br>- Reconnect players<br>- Resume operations |
| ERROR | RECOVERY_FAILED | INITIALIZING | - Force restart<br>- Clear all states<br>- Reconnect all players |
