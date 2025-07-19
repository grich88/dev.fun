import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

export class GameService {
  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.houseWallet = 'HOUSE_WALLET_MOCK';
    this.entryFee = 5; // PUMP tokens
    this.houseFee = 0.05; // 5%
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    
    console.log('🎲 GameService initialized');
    this.initialized = true;
    
    // Mock some initial data - increase house balance to handle larger bets
    this.mockHouseBalance = 1000000; // 1 million PUMP tokens
  }

  // Generate pseudo-random coin flip using current timestamp and player address
  generateCoinFlip(gameId, playerAddress) {
    const seed = Date.now().toString() + gameId + playerAddress;
    const hash = CryptoJS.SHA256(seed).toString();
    const randomValue = parseInt(hash.substring(0, 8), 16);
    return (randomValue % 2) === 0 ? 'heads' : 'tails';
  }

  // Join multiplayer game
  async joinMultiplayerGame(playerAddress) {
    console.log('🎮 Joining multiplayer game:', playerAddress);
    
    // Simulate wallet balance check
    await this.simulateDelay(500);
    
    if (!playerAddress) {
      throw new Error('Wallet not connected');
    }

    // Find existing game or create new one
    let gameId = this.findActiveMultiplayerGame();
    let gameData;

    if (!gameId) {
      // Create new game
      gameId = uuidv4();
      gameData = {
        gameId,
        type: 'multiplayer',
        status: 'waiting',
        players: [],
        potSize: 0,
        houseFee: 0,
        currentPlayerIndex: 0,
        createdAt: Date.now(),
        maxPlayers: 8,
        entryFee: this.entryFee
      };
      this.games.set(gameId, gameData);
    } else {
      gameData = this.games.get(gameId);
    }

    // Check if player already in game
    const existingPlayer = gameData.players.find(p => p.address === playerAddress);
    if (existingPlayer) {
      throw new Error('Already in this game');
    }

    // Add player to game
    const player = {
      address: playerAddress,
      nickname: `Player${gameData.players.length + 1}`,
      streak: 0,
      maxStreak: 0,
      status: 'waiting',
      joinedAt: Date.now(),
      hasPaid: true // Mock payment
    };

    gameData.players.push(player);
    gameData.potSize += this.entryFee;

    // Start game if we have 2+ players
    if (gameData.players.length >= 2 && gameData.status === 'waiting') {
      gameData.status = 'active';
      gameData.startedAt = Date.now();
      gameData.players[0].status = 'playing';
    }

    this.games.set(gameId, gameData);

    return {
      gameId,
      players: gameData.players,
      potSize: gameData.potSize,
      houseFee: Math.round(gameData.potSize * this.houseFee * 100) / 100,
      currentPlayer: gameData.players[gameData.currentPlayerIndex]?.address,
      isPlayerTurn: gameData.currentPlayerIndex === gameData.players.length - 1,
      gameStatus: gameData.status
    };
  }

  // Start solo game
  async startSoloGame(playerAddress, betAmount) {
    console.log('🎲 Starting solo game:', playerAddress, 'bet:', betAmount);
    
    await this.simulateDelay(300);
    
    if (!playerAddress) {
      throw new Error('Wallet not connected');
    }

    if (betAmount < 1 || betAmount > 100) {
      throw new Error('Bet amount must be between 1 and 100 PUMP tokens');
    }

    // Check house balance - max streak of 7 for safety
    const maxPayout = betAmount * Math.pow(2, 7);
    if (this.mockHouseBalance < maxPayout) {
      throw new Error(`House insufficient funds for this bet (max payout: ${maxPayout} PUMP)`);
    }

    const gameId = uuidv4();
    const gameData = {
      gameId,
      type: 'solo',
      status: 'active',
      playerAddress,
      betAmount,
      currentStreak: 0,
      maxStreak: 0,
      createdAt: Date.now(),
      houseBalance: this.mockHouseBalance
    };

    this.games.set(gameId, gameData);

    return {
      gameId,
      betAmount,
      currentStreak: 0,
      maxStreak: 0,
      potentialPayout: betAmount * 2,
      houseBalance: this.mockHouseBalance,
      isPlayerTurn: true,
      gameStatus: 'active'
    };
  }

  // Flip coin
  async flipCoin(gameId, playerAddress) {
    console.log('🪙 Flipping coin:', gameId, playerAddress);
    
    await this.simulateDelay(1000); // Simulate coin flip animation time
    
    const gameData = this.games.get(gameId);
    if (!gameData) {
      throw new Error('Game not found');
    }

    const outcome = this.generateCoinFlip(gameId, playerAddress);
    console.log('Flip result:', outcome);

    if (gameData.type === 'solo') {
      return this.handleSoloFlip(gameData, outcome);
    } else {
      return this.handleMultiplayerFlip(gameData, playerAddress, outcome);
    }
  }

  // Handle solo mode flip
  handleSoloFlip(gameData, outcome) {
    if (outcome === 'heads') {
      gameData.currentStreak += 1;
      gameData.maxStreak = Math.max(gameData.maxStreak, gameData.currentStreak);
      
      const potentialPayout = gameData.betAmount * Math.pow(2, gameData.currentStreak);
      
      return {
        outcome: 'heads',
        streak: gameData.currentStreak,
        maxStreak: gameData.maxStreak,
        potentialPayout,
        isPlayerTurn: true,
        status: 'active'
      };
    } else {
      // Bust
      gameData.status = 'finished';
      gameData.currentStreak = 0;
      gameData.finishedAt = Date.now();
      
      // House wins the bet
      this.mockHouseBalance += gameData.betAmount;
      
      return {
        outcome: 'tails',
        streak: 0,
        maxStreak: gameData.maxStreak,
        potentialPayout: 0,
        isPlayerTurn: false,
        status: 'busted'
      };
    }
  }

  // Handle multiplayer flip
  handleMultiplayerFlip(gameData, playerAddress, outcome) {
    const playerIndex = gameData.players.findIndex(p => p.address === playerAddress);
    if (playerIndex === -1) {
      throw new Error('Player not in game');
    }

    const player = gameData.players[playerIndex];
    
    if (gameData.currentPlayerIndex !== playerIndex) {
      throw new Error('Not your turn');
    }

    if (outcome === 'heads') {
      player.streak += 1;
      player.maxStreak = Math.max(player.maxStreak, player.streak);
      
      return {
        outcome: 'heads',
        streak: player.streak,
        maxStreak: player.maxStreak,
        isPlayerTurn: true,
        status: 'active'
      };
    } else {
      // Bust - move to next player
      player.status = 'busted';
      player.streak = 0;
      
      // Find next active player
      const nextPlayerIndex = this.findNextActivePlayer(gameData);
      if (nextPlayerIndex === -1) {
        // Game over - determine winner
        this.endMultiplayerGame(gameData);
      } else {
        gameData.currentPlayerIndex = nextPlayerIndex;
        gameData.players[nextPlayerIndex].status = 'playing';
      }
      
      return {
        outcome: 'tails',
        streak: 0,
        maxStreak: player.maxStreak,
        isPlayerTurn: false,
        status: player.status
      };
    }
  }

  // Cash out
  async cashOut(gameId, playerAddress) {
    console.log('💰 Cashing out:', gameId, playerAddress);
    
    await this.simulateDelay(500);
    
    const gameData = this.games.get(gameId);
    if (!gameData) {
      throw new Error('Game not found');
    }

    if (gameData.type === 'solo') {
      gameData.status = 'cashed_out';
      gameData.finalStreak = gameData.currentStreak;
      gameData.finishedAt = Date.now();
      
      const payout = gameData.betAmount * Math.pow(2, gameData.currentStreak);
      this.mockHouseBalance -= payout;
      
      return {
        streak: gameData.currentStreak,
        payout,
        status: 'cashed_out'
      };
    } else {
      const playerIndex = gameData.players.findIndex(p => p.address === playerAddress);
      const player = gameData.players[playerIndex];
      
      player.status = 'cashed_out';
      player.finalStreak = player.streak;
      
      // Move to next player
      const nextPlayerIndex = this.findNextActivePlayer(gameData);
      if (nextPlayerIndex === -1) {
        this.endMultiplayerGame(gameData);
      } else {
        gameData.currentPlayerIndex = nextPlayerIndex;
        gameData.players[nextPlayerIndex].status = 'playing';
      }
      
      return {
        streak: player.streak,
        status: 'cashed_out'
      };
    }
  }

  // Claim winnings
  async claimWinnings(gameId, playerAddress) {
    console.log('🏆 Claiming winnings:', gameId, playerAddress);
    
    await this.simulateDelay(1000);
    
    const gameData = this.games.get(gameId);
    if (!gameData) {
      throw new Error('Game not found');
    }

    if (gameData.type === 'solo') {
      if (gameData.status !== 'cashed_out') {
        throw new Error('No winnings to claim');
      }
      
      const payout = gameData.betAmount * Math.pow(2, gameData.finalStreak);
      
      // Clean up game
      this.games.delete(gameId);
      
      return {
        amount: payout,
        type: 'solo'
      };
    } else {
      if (gameData.status !== 'finished') {
        throw new Error('Game not finished');
      }
      
      const winner = gameData.players.find(p => p.address === playerAddress);
      if (!winner || !winner.isWinner) {
        throw new Error('You are not the winner');
      }
      
      const totalPot = gameData.potSize;
      const houseFeeAmount = totalPot * this.houseFee;
      const winnings = totalPot - houseFeeAmount;
      
      // Clean up game
      this.games.delete(gameId);
      
      return {
        amount: winnings,
        type: 'multiplayer',
        houseFee: houseFeeAmount
      };
    }
  }

  // Helper methods
  findActiveMultiplayerGame() {
    for (const [gameId, gameData] of this.games) {
      if (gameData.type === 'multiplayer' && 
          gameData.status === 'waiting' && 
          gameData.players.length < gameData.maxPlayers) {
        return gameId;
      }
    }
    return null;
  }

  findNextActivePlayer(gameData) {
    for (let i = gameData.currentPlayerIndex + 1; i < gameData.players.length; i++) {
      if (gameData.players[i].status === 'waiting') {
        return i;
      }
    }
    return -1;
  }

  endMultiplayerGame(gameData) {
    gameData.status = 'finished';
    gameData.finishedAt = Date.now();
    
    // Find winner (highest streak)
    let winner = null;
    let highestStreak = -1;
    
    for (const player of gameData.players) {
      const finalStreak = player.finalStreak ?? player.maxStreak;
      if (finalStreak > highestStreak) {
        highestStreak = finalStreak;
        winner = player;
      }
    }
    
    if (winner) {
      winner.isWinner = true;
      gameData.winner = winner.address;
    }
  }

  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get game state
  getGameState(gameId) {
    return this.games.get(gameId);
  }

  // Get payout table for solo mode
  getPayoutTable(betAmount = 1) {
    const payouts = [];
    for (let streak = 1; streak <= 10; streak++) {
      payouts.push({
        streak,
        payout: betAmount * Math.pow(2, streak),
        odds: `1 in ${Math.pow(2, streak)}`
      });
    }
    return payouts;
  }

  // Get game statistics
  getGameStats() {
    return {
      activeGames: this.games.size,
      houseBalance: this.mockHouseBalance,
      totalPlayers: this.players.size
    };
  }
} 