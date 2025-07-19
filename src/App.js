import React, { useState, useEffect } from 'react';

// Import CSS
import './App.css';

// Import components
import GameHeader from './components/GameHeader';
import GameBoard from './components/GameBoard';
import GameSidebar from './components/GameSidebar';
import GameModal from './components/GameModal';

// Import services
import { GameService } from './services/GameService';
import { WalletService } from './services/WalletService';

// Game modes
const GAME_MODES = {
  LOBBY: 'lobby',
  MULTIPLAYER: 'multiplayer',
  SOLO: 'solo',
  FINISHED: 'finished'
};

function App() {
  // Game state
  const [gameState, setGameState] = useState({
    mode: GAME_MODES.LOBBY,
    gameId: null,
    players: [],
    currentPlayer: null,
    potSize: 0,
    houseFee: 0,
    currentStreak: 0,
    maxStreak: 0,
    isPlayerTurn: false,
    gameStatus: 'waiting',
    winner: null,
    payoutAmount: 0
  });

  // UI state
  const [uiState, setUiState] = useState({
    isLoading: false,
    error: null,
    modal: null,
    notification: null,
    isFlipping: false,
    lastFlipResult: null
  });

  // Wallet state
  const [walletState, setWalletState] = useState({
    connected: false,
    address: null,
    balance: 0,
    tokenBalance: 0
  });

  // Game service instance
  const [gameService] = useState(() => new GameService());
  const [walletService] = useState(() => new WalletService());

  // Initialize services
  useEffect(() => {
    gameService.initialize();
    walletService.initialize();
  }, [gameService, walletService]);

  // Handle wallet connection (mock)
  const handleWalletConnect = async () => {
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      
      const walletInfo = await walletService.connect();
      setWalletState(walletInfo);
      
      showNotification('Wallet connected successfully!', 'success');
    } catch (error) {
      console.error('Wallet connection failed:', error);
      showNotification('Failed to connect wallet', 'error');
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle wallet disconnect
  const handleWalletDisconnect = async () => {
    try {
      await walletService.disconnect();
      setWalletState({
        connected: false,
        address: null,
        balance: 0,
        tokenBalance: 0
      });
      showNotification('Wallet disconnected', 'warning');
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
    }
  };

  // Join multiplayer game
  const handleJoinGame = async () => {
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      
      const gameData = await gameService.joinMultiplayerGame(walletState.address);
      setGameState(prev => ({
        ...prev,
        mode: GAME_MODES.MULTIPLAYER,
        ...gameData
      }));
      
      showNotification('Joined game successfully!', 'success');
    } catch (error) {
      console.error('Failed to join game:', error);
      showNotification(error.message || 'Failed to join game', 'error');
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Start solo game
  const handleStartSolo = async (betAmount) => {
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      
      const gameData = await gameService.startSoloGame(walletState.address, betAmount);
      setGameState(prev => ({
        ...prev,
        mode: GAME_MODES.SOLO,
        ...gameData
      }));
      
      showNotification('Solo game started!', 'success');
    } catch (error) {
      console.error('Failed to start solo game:', error);
      showNotification(error.message || 'Failed to start solo game', 'error');
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Flip coin
  const handleFlipCoin = async () => {
    try {
      setUiState(prev => ({ ...prev, isFlipping: true }));
      
      const result = await gameService.flipCoin(gameState.gameId, walletState.address);
      
      setUiState(prev => ({ 
        ...prev, 
        lastFlipResult: result.outcome,
        isFlipping: false 
      }));
      
      setGameState(prev => ({
        ...prev,
        currentStreak: result.streak,
        maxStreak: Math.max(prev.maxStreak, result.streak),
        gameStatus: result.status,
        isPlayerTurn: result.isPlayerTurn
      }));

      if (result.outcome === 'heads') {
        showNotification(`Heads! Streak: ${result.streak}`, 'success');
      } else {
        showNotification('Tails! You busted!', 'error');
      }
    } catch (error) {
      console.error('Flip failed:', error);
      showNotification(error.message || 'Flip failed', 'error');
      setUiState(prev => ({ ...prev, isFlipping: false }));
    }
  };

  // Cash out
  const handleCashOut = async () => {
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      
      await gameService.cashOut(gameState.gameId, walletState.address);
      
      setGameState(prev => ({
        ...prev,
        gameStatus: 'cashed_out',
        isPlayerTurn: false
      }));
      
      showNotification(`Cashed out with streak ${gameState.currentStreak}!`, 'success');
    } catch (error) {
      console.error('Cash out failed:', error);
      showNotification(error.message || 'Cash out failed', 'error');
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Claim winnings
  const handleClaimWinnings = async () => {
    try {
      setUiState(prev => ({ ...prev, isLoading: true }));
      
      const result = await gameService.claimWinnings(gameState.gameId, walletState.address);
      
      setGameState(prev => ({
        ...prev,
        mode: GAME_MODES.LOBBY,
        payoutAmount: result.amount
      }));
      
      // Update wallet balance
      const updatedWallet = await walletService.updateBalance(walletState.address);
      setWalletState(prev => ({ ...prev, ...updatedWallet }));
      
      showNotification(`Claimed ${result.amount} PUMP tokens!`, 'success');
    } catch (error) {
      console.error('Claim failed:', error);
      showNotification(error.message || 'Claim failed', 'error');
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Start new game
  const handleNewGame = () => {
    setGameState({
      mode: GAME_MODES.LOBBY,
      gameId: null,
      players: [],
      currentPlayer: null,
      potSize: 0,
      houseFee: 0,
      currentStreak: 0,
      maxStreak: 0,
      isPlayerTurn: false,
      gameStatus: 'waiting',
      winner: null,
      payoutAmount: 0
    });
    
    setUiState(prev => ({
      ...prev,
      lastFlipResult: null,
      isFlipping: false
    }));
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    setUiState(prev => ({ 
      ...prev, 
      notification: { message, type } 
    }));
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setUiState(prev => ({ ...prev, notification: null }));
    }, 3000);
  };

  // Show modal
  const showModal = (modalType, data = {}) => {
    setUiState(prev => ({ 
      ...prev, 
      modal: { type: modalType, data } 
    }));
  };

  // Hide modal
  const hideModal = () => {
    setUiState(prev => ({ ...prev, modal: null }));
  };

  // Add devnet flag
  const isDevnet = window.location.hostname === 'localhost';

  // Airdrop SOL (devnet only)
  const handleAirdrop = async () => {
    if (!walletState.address) return;
    setUiState(prev => ({ ...prev, isLoading: true }));
    try {
      await walletService.airdropSol(walletState.address, 1);
      await walletService.updateBalance(walletState.address);
      setWalletState(prev => ({ ...prev, balance: prev.balance + 1 }));
      showNotification('Airdrop successful! 1 SOL added.', 'success');
    } catch (error) {
      showNotification('Airdrop failed: ' + (error.message || error), 'error');
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="game-container">
      <GameHeader
        walletState={walletState}
        onWalletConnect={handleWalletConnect}
        onWalletDisconnect={handleWalletDisconnect}
        gameState={gameState}
        onAirdrop={handleAirdrop}
        isDevnet={isDevnet}
      />
      
      <div className="game-main">
        <GameBoard
          gameState={gameState}
          uiState={uiState}
          walletState={walletState}
          onFlipCoin={handleFlipCoin}
          onCashOut={handleCashOut}
          onJoinGame={handleJoinGame}
          onStartSolo={handleStartSolo}
          onClaimWinnings={handleClaimWinnings}
          onNewGame={handleNewGame}
        />
        
        <GameSidebar
          gameState={gameState}
          walletState={walletState}
          onJoinGame={handleJoinGame}
          onStartSolo={handleStartSolo}
          showModal={showModal}
        />
      </div>

      {/* Modal */}
      {uiState.modal && (
        <GameModal
          modal={uiState.modal}
          onClose={hideModal}
          gameState={gameState}
          walletState={walletState}
        />
      )}

      {/* Notification */}
      {uiState.notification && (
        <div className={`notification ${uiState.notification.type}`}>
          {uiState.notification.message}
        </div>
      )}
    </div>
  );
}

export default App; 