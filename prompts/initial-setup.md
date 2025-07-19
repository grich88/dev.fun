# High Stakes Coin Flip Showdown - dev.fun Prompts

## 🎲 Game Overview
Create a high-stakes coin flip game where players can compete in solo mode against the house or multiplayer mode against other players. The game features exponential payouts, streak-based multipliers, and uses PUMP tokens for betting.

## 📋 Core Features
- Solo mode (player vs house)
- Multiplayer mode (2-8 players)
- Exponential payouts (2x per streak)
- On-chain randomness
- PUMP token integration
- Professional casino UI

## 🚀 Implementation Prompts

### 1️⃣ Initial Setup & Smart Contract

```prompt
Create a Solana smart contract for a coin flip casino game with the following features:

1. State Management:
- Game modes: solo and multiplayer
- Player data: address, streak, max streak
- Game data: pot size, house fee, status
- House wallet and balance tracking

2. Core Functions:
- Initialize game and settings
- Place bets and join games
- Generate random flip using Solana blockhash
- Handle payouts and house fees
- Track player statistics

3. Security Features:
- Escrow for bets
- House balance checks
- Rate limiting
- Emergency withdrawal

Use PUMP tokens for all bets and payouts. Include proper error handling and events.
```

### 2️⃣ Game Logic & Mechanics

```prompt
Implement the core game logic with these specifications:

1. Solo Mode:
- Bet range: 1-100 PUMP tokens
- Exponential payouts: 2^streak × bet
- Maximum streak: 7 (128x multiplier)
- House edge: 0% (fair odds)
- Cash out anytime

2. Multiplayer Mode:
- Entry fee: 5 PUMP tokens
- 2-8 players per round
- Turn-based flipping
- House fee: 5% of pot
- Winner takes 95% of pot

3. Randomness:
- Use Solana blockhash for entropy
- Verifiable and fair system
- Multiple hash combinations

Include comprehensive testing functions.
```

### 3️⃣ Frontend Components

```prompt
Create a professional casino-themed UI with:

1. Layout Components:
- Header with wallet info
- Main game board
- Player list sidebar
- Game statistics
- Modals for rules/stats

2. Game Interface:
- Animated coin flips
- Streak counter
- Payout calculator
- Timer for turns
- Cash out button

3. Visual Elements:
- Gold/black casino theme
- Particle effects
- Sound effects
- Responsive design
- Loading states

Use modern React patterns and smooth animations.
```

### 4️⃣ Wallet Integration

```prompt
Implement wallet features:

1. Connection:
- Support Phantom/Solflare
- Balance display
- Transaction history
- Auto-reconnect

2. Token Handling:
- PUMP token integration
- Bet escrow system
- Automatic payouts
- Fee calculations

3. Transaction UX:
- Clear success/error states
- Transaction previews
- Gas fee estimates
- Confirmation dialogs
```

### 5️⃣ Enhanced Features

```prompt
Add competitive features:

1. Player Profiles:
- Nicknames
- Achievement badges
- Win/loss statistics
- Biggest wins

2. Leaderboards:
- Daily high scores
- Longest streaks
- Biggest pots
- Most PUMP won

3. Social Features:
- Player chat
- Emotes/reactions
- Share results
- Friend challenges

4. Tournaments:
- Daily/weekly events
- Special multipliers
- Prize pools
- Entry requirements
```

### 6️⃣ Polish & Launch

```prompt
Implement final polish:

1. UI/UX:
- Loading animations
- Error handling
- Help tooltips
- Tutorial mode

2. Mobile Support:
- Responsive layout
- Touch controls
- PWA features
- Portrait/landscape

3. Performance:
- Code splitting
- Asset optimization
- Cache strategy
- Error boundaries

4. Analytics:
- Usage tracking
- Error reporting
- Performance metrics
- Player feedback
```

## 🔄 Testing Flow

1. Start with solo mode testing:
   - Connect wallet
   - Place test bets
   - Verify payouts
   - Check edge cases

2. Test multiplayer features:
   - Room creation
   - Player joining
   - Turn handling
   - Pot distribution

3. Verify security:
   - Contract safety
   - Transaction handling
   - Rate limiting
   - Emergency stops

## 📈 Success Metrics

1. Game Health:
   - Player retention
   - Average session time
   - Return rate
   - Token volume

2. Technical:
   - Transaction success rate
   - UI responsiveness
   - Error frequency
   - Load times

## 🎯 Launch Checklist

1. Contract:
   - Security audit
   - Test coverage
   - Gas optimization
   - Emergency controls

2. Frontend:
   - Cross-browser testing
   - Mobile testing
   - Load testing
   - UX review

3. Documentation:
   - Player guide
   - API docs
   - Contract specs
   - Support info

4. Marketing:
   - Twitter announcement
   - Demo video
   - Feature highlights
   - Community engagement 