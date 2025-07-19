import React from 'react';

const GameSidebar = ({ gameState, walletState, onJoinGame, onStartSolo, showModal }) => {
  
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  const renderPlayerList = () => {
    if (!gameState.players || gameState.players.length === 0) {
      return (
        <div className="no-players">
          <p>No players yet</p>
        </div>
      );
    }

    return gameState.players.map((player, index) => (
      <div 
        key={player.address} 
        className={`player-item ${player.status === 'playing' ? 'current' : ''} ${player.isWinner ? 'winner' : ''} ${player.status === 'busted' ? 'busted' : ''}`}
      >
        <div className="player-info">
          <div className="player-name">
            {player.nickname || formatAddress(player.address)}
            {player.address === walletState.address && ' (You)'}
          </div>
          <div className="player-status">
            {player.status === 'playing' && '🎯 Playing'}
            {player.status === 'waiting' && '⏳ Waiting'}
            {player.status === 'cashed_out' && '💰 Cashed Out'}
            {player.status === 'busted' && '💥 Busted'}
            {player.isWinner && '🏆 Winner'}
          </div>
        </div>
        <div className="player-streak">
          {player.finalStreak ?? player.maxStreak ?? player.streak ?? 0}
        </div>
      </div>
    ));
  };

  const renderGameInfo = () => {
    if (gameState.mode === 'lobby') {
      return (
        <div className="game-info">
          <h3>Game Rules</h3>
          <ul>
            <li>🪙 Flip a coin to build your streak</li>
            <li>👑 Heads = continue your streak</li>
            <li>❌ Tails = bust and lose</li>
            <li>💰 Cash out anytime to lock your streak</li>
            <li>🏆 Longest streak wins the pot</li>
          </ul>
          
          <div className="quick-stats">
            <h4>Quick Stats</h4>
            <div className="stat-item">
              <span>Entry Fee:</span>
              <span>5 PUMP</span>
            </div>
            <div className="stat-item">
              <span>House Fee:</span>
              <span>5%</span>
            </div>
            <div className="stat-item">
              <span>Max Players:</span>
              <span>8</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="game-info">
        <h3>Current Game</h3>
        <div className="game-details">
          <div className="detail-item">
            <span>Mode:</span>
            <span>{gameState.mode === 'solo' ? 'Solo vs House' : 'Multiplayer'}</span>
          </div>
          {gameState.mode === 'multiplayer' && (
            <>
              <div className="detail-item">
                <span>Players:</span>
                <span>{gameState.players?.length || 0}/8</span>
              </div>
              <div className="detail-item">
                <span>Pot Size:</span>
                <span>{gameState.potSize || 0} PUMP</span>
              </div>
              <div className="detail-item">
                <span>House Fee:</span>
                <span>{gameState.houseFee || 0} PUMP</span>
              </div>
            </>
          )}
          {gameState.mode === 'solo' && (
            <>
              <div className="detail-item">
                <span>Bet Amount:</span>
                <span>{gameState.betAmount || 0} PUMP</span>
              </div>
              <div className="detail-item">
                <span>Current Streak:</span>
                <span>{gameState.currentStreak || 0}</span>
              </div>
              <div className="detail-item">
                <span>Max Streak:</span>
                <span>{gameState.maxStreak || 0}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="game-sidebar">
      {gameState.mode === 'multiplayer' && (
        <div className="pot-display">
          <div className="pot-label">Prize Pool</div>
          <div className="pot-amount">{gameState.potSize || 0} PUMP</div>
          {gameState.houseFee > 0 && (
            <div className="house-fee">House fee: {gameState.houseFee} PUMP</div>
          )}
        </div>
      )}

      {gameState.mode === 'multiplayer' && (
        <div className="player-list">
          <h3>Players ({gameState.players?.length || 0}/8)</h3>
          {renderPlayerList()}
        </div>
      )}

      {renderGameInfo()}

      <div className="sidebar-actions">
        {gameState.mode === 'lobby' && walletState.connected && (
          <>
            <button 
              className="game-button button-primary mb-sm"
              onClick={onJoinGame}
            >
              Join Multiplayer
            </button>
            <button 
              className="game-button button-secondary"
              onClick={() => showModal('solo-setup')}
            >
              Play Solo
            </button>
          </>
        )}
        
        <button 
          className="game-button mb-sm"
          onClick={() => showModal('rules')}
        >
          📖 Game Rules
        </button>
        
        <button 
          className="game-button"
          onClick={() => showModal('stats')}
        >
          📊 Statistics
        </button>
      </div>

      {walletState.connected && (
        <div className="wallet-info-sidebar">
          <h4>Your Wallet</h4>
          <div className="balance-info">
            <div className="balance-item">
              <span>PUMP Tokens:</span>
              <span>{walletState.tokenBalance || 0}</span>
            </div>
            <div className="balance-item">
              <span>SOL Balance:</span>
              <span>{walletState.balance || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSidebar; 