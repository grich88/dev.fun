import React, { useState } from 'react';

const GameBoard = ({ 
  gameState, 
  uiState, 
  walletState, 
  onFlipCoin, 
  onCashOut, 
  onJoinGame, 
  onStartSolo, 
  onClaimWinnings, 
  onNewGame 
}) => {
  const [betAmount, setBetAmount] = useState(10);
  const [showPayoutTable, setShowPayoutTable] = useState(false);

  // Calculate potential payout for solo mode
  const calculatePayout = (streak, bet) => {
    return bet * Math.pow(2, streak);
  };

  // Render lobby screen
  const renderLobby = () => (
    <div className="lobby-screen fade-in">
      <div className="game-welcome">
        <h2>Welcome to High Stakes Coin Flip Showdown!</h2>
        <p>Choose your game mode:</p>
      </div>
      
      <div className="game-mode-selection">
        <div className="mode-card">
          <h3>🎮 Multiplayer</h3>
          <p>Compete against other players for the biggest pot!</p>
          <ul>
            <li>Entry fee: 5 PUMP tokens</li>
            <li>2-8 players per round</li>
            <li>Winner takes 95% of pot</li>
            <li>Longest streak wins</li>
          </ul>
          <button 
            className="game-button button-primary"
            onClick={onJoinGame}
            disabled={!walletState.connected || uiState.isLoading}
          >
            {uiState.isLoading ? 'Joining...' : 'Join Multiplayer Game'}
          </button>
        </div>
        
        <div className="mode-card">
          <h3>🎯 Solo Mode</h3>
          <p>Challenge the house with exponential payouts!</p>
          <div className="bet-selector">
            <label>Bet Amount:</label>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="bet-input"
            />
            <span>PUMP tokens</span>
          </div>
          <p>Potential payout: {calculatePayout(1, betAmount)} PUMP (1 streak)</p>
          <button 
            className="game-button button-secondary"
            onClick={() => onStartSolo(betAmount)}
            disabled={!walletState.connected || uiState.isLoading || betAmount < 1 || betAmount > 100}
          >
            {uiState.isLoading ? 'Starting...' : 'Start Solo Game'}
          </button>
          <button 
            className="payout-table-btn"
            onClick={() => setShowPayoutTable(!showPayoutTable)}
          >
            {showPayoutTable ? 'Hide' : 'Show'} Payout Table
          </button>
          {showPayoutTable && renderPayoutTable()}
        </div>
      </div>
    </div>
  );

  // Render payout table for solo mode
  const renderPayoutTable = () => (
    <div className="payout-table">
      <h4>Payout Table (Bet: {betAmount} PUMP)</h4>
      <table>
        <thead>
          <tr>
            <th>Streak</th>
            <th>Payout</th>
            <th>Probability</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7].map(streak => (
            <tr key={streak}>
              <td>{streak}</td>
              <td>{calculatePayout(streak, betAmount)} PUMP</td>
              <td>1 in {Math.pow(2, streak)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render active game
  const renderActiveGame = () => (
    <div className="active-game fade-in">
      <div className="game-status">
        <h2>
          {gameState.mode === 'solo' ? 'Solo Mode' : `Multiplayer - Round ${gameState.gameId?.substring(0, 8)}`}
        </h2>
        {gameState.mode === 'solo' && (
          <p>Bet: {gameState.betAmount || betAmount} PUMP | Potential: {calculatePayout(gameState.currentStreak + 1, gameState.betAmount || betAmount)} PUMP</p>
        )}
      </div>

      <div className="coin-container">
        <div className={`coin ${uiState.isFlipping ? 'flipping' : ''}`}>
          {uiState.isFlipping ? '🪙' : (uiState.lastFlipResult === 'heads' ? '👑' : uiState.lastFlipResult === 'tails' ? '❌' : '🪙')}
        </div>
        
        {uiState.lastFlipResult && (
          <div className={`coin-result show ${uiState.lastFlipResult}`}>
            {uiState.lastFlipResult === 'heads' ? 'HEADS! ✅' : 'TAILS! ❌'}
          </div>
        )}
      </div>

      <div className="streak-display">
        <div className="streak-counter">
          {gameState.currentStreak}
        </div>
        <div className="streak-label">Current Streak</div>
        {gameState.maxStreak > 0 && (
          <div className="max-streak">Best: {gameState.maxStreak}</div>
        )}
      </div>

      <div className="game-controls">
        {gameState.isPlayerTurn && gameState.gameStatus === 'active' && (
          <>
            <button 
              className="game-button button-primary"
              onClick={onFlipCoin}
              disabled={uiState.isFlipping || uiState.isLoading}
            >
              {uiState.isFlipping ? 'Flipping...' : 'Flip Coin'}
            </button>
            
            {gameState.currentStreak > 0 && (
              <button 
                className="game-button button-secondary"
                onClick={onCashOut}
                disabled={uiState.isLoading}
              >
                Cash Out ({gameState.currentStreak} streak)
              </button>
            )}
          </>
        )}

        {gameState.gameStatus === 'cashed_out' && (
          <div className="game-result">
            <h3>Cashed Out!</h3>
            <p>Final streak: {gameState.currentStreak}</p>
            {gameState.mode === 'solo' && (
              <button 
                className="game-button button-primary"
                onClick={onClaimWinnings}
                disabled={uiState.isLoading}
              >
                Claim Winnings
              </button>
            )}
          </div>
        )}

        {gameState.gameStatus === 'busted' && (
          <div className="game-result bust-effect">
            <h3>Busted! 💥</h3>
            <p>Better luck next time!</p>
            <button 
              className="game-button button-secondary"
              onClick={onNewGame}
            >
              New Game
            </button>
          </div>
        )}

        {gameState.gameStatus === 'finished' && gameState.mode === 'multiplayer' && (
          <div className="game-result">
            <h3>Game Finished!</h3>
            {gameState.winner && (
              <p>Winner: {gameState.winner}</p>
            )}
            <button 
              className="game-button button-secondary"
              onClick={onNewGame}
            >
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render waiting screen
  const renderWaiting = () => (
    <div className="waiting-screen fade-in">
      <div className="loading-spinner"></div>
      <h3>Waiting for more players...</h3>
      <p>Game will start when 2+ players join</p>
      <button 
        className="game-button button-danger"
        onClick={onNewGame}
      >
        Leave Game
      </button>
    </div>
  );

  // Main render logic
  const renderGame = () => {
    if (!walletState.connected) {
      return (
        <div className="connect-wallet-prompt">
          <h2>🔗 Connect Your Wallet</h2>
          <p>Please connect your Solana wallet to start playing</p>
        </div>
      );
    }

    switch (gameState.mode) {
      case 'lobby':
        return renderLobby();
      case 'multiplayer':
      case 'solo':
        if (gameState.gameStatus === 'waiting') {
          return renderWaiting();
        }
        return renderActiveGame();
      default:
        return renderLobby();
    }
  };

  return (
    <div className="game-board">
      {uiState.isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <div className="loading-text">Processing...</div>
          </div>
        </div>
      )}
      
      {renderGame()}
    </div>
  );
};

export default GameBoard; 