import React from 'react';

const GameModal = ({ modal, onClose, gameState, walletState }) => {
  
  const renderRulesModal = () => (
    <div className="modal-content">
      <h2>🎲 Game Rules</h2>
      
      <div className="rules-section">
        <h3>🎮 Multiplayer Mode</h3>
        <ul>
          <li>Pay 5 PUMP tokens to join a round</li>
          <li>Players take turns flipping a coin</li>
          <li>Heads = continue your streak, Tails = bust</li>
          <li>After each heads, choose: "Flip Again" or "Cash Out"</li>
          <li>Longest streak wins 95% of the pot (5% house fee)</li>
          <li>Maximum 8 players per round</li>
        </ul>
      </div>

      <div className="rules-section">
        <h3>🎯 Solo Mode</h3>
        <ul>
          <li>Choose your bet amount (1-100 PUMP tokens)</li>
          <li>Flip coins to build your streak</li>
          <li>Payout = 2^streak × bet amount</li>
          <li>Cash out anytime to claim winnings</li>
          <li>Bust (tails) = lose your entire bet</li>
        </ul>
      </div>

      <div className="rules-section">
        <h3>🎲 Coin Flip Mechanics</h3>
        <ul>
          <li>Fair 50/50 probability for heads/tails</li>
          <li>Randomness generated on-chain using Solana blockhash</li>
          <li>All results are transparent and verifiable</li>
          <li>No house manipulation possible</li>
        </ul>
      </div>

      <div className="payout-examples">
        <h3>💰 Solo Mode Payout Examples</h3>
        <table>
          <thead>
            <tr>
              <th>Streak</th>
              <th>10 PUMP Bet</th>
              <th>Probability</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>20 PUMP</td><td>50%</td></tr>
            <tr><td>2</td><td>40 PUMP</td><td>25%</td></tr>
            <tr><td>3</td><td>80 PUMP</td><td>12.5%</td></tr>
            <tr><td>4</td><td>160 PUMP</td><td>6.25%</td></tr>
            <tr><td>5</td><td>320 PUMP</td><td>3.125%</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStatsModal = () => (
    <div className="modal-content">
      <h2>📊 Statistics</h2>
      
      <div className="stats-section">
        <h3>🎮 Current Session</h3>
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-label">Games Played:</span>
            <span className="stat-value">0</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Games Won:</span>
            <span className="stat-value">0</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Highest Streak:</span>
            <span className="stat-value">{gameState.maxStreak || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Wagered:</span>
            <span className="stat-value">0 PUMP</span>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h3>🎲 Probability Reference</h3>
        <table>
          <thead>
            <tr>
              <th>Consecutive Heads</th>
              <th>Probability</th>
              <th>Odds</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>50%</td><td>1 in 2</td></tr>
            <tr><td>2</td><td>25%</td><td>1 in 4</td></tr>
            <tr><td>3</td><td>12.5%</td><td>1 in 8</td></tr>
            <tr><td>4</td><td>6.25%</td><td>1 in 16</td></tr>
            <tr><td>5</td><td>3.125%</td><td>1 in 32</td></tr>
            <tr><td>6</td><td>1.56%</td><td>1 in 64</td></tr>
            <tr><td>7</td><td>0.78%</td><td>1 in 128</td></tr>
          </tbody>
        </table>
      </div>

      <div className="stats-section">
        <h3>💡 Tips</h3>
        <ul>
          <li>Early cash-outs are safer but offer smaller rewards</li>
          <li>Each additional flip doubles your potential payout</li>
          <li>The house edge in multiplayer comes from the 5% fee</li>
          <li>Solo mode has no house edge, but requires luck</li>
        </ul>
      </div>
    </div>
  );

  const renderSoloSetupModal = () => (
    <div className="modal-content">
      <h2>🎯 Solo Mode Setup</h2>
      <p>Challenge the house with exponential payouts!</p>
      
      <div className="solo-setup-form">
        <div className="bet-input-group">
          <label>Bet Amount:</label>
          <input 
            type="number" 
            min="1" 
            max="100" 
            defaultValue="10"
            className="bet-input"
          />
          <span>PUMP tokens</span>
        </div>
        
        <div className="payout-preview">
          <h4>Potential Payouts:</h4>
          <div className="payout-list">
            <div>1 streak: 20 PUMP</div>
            <div>2 streak: 40 PUMP</div>
            <div>3 streak: 80 PUMP</div>
            <div>4 streak: 160 PUMP</div>
            <div>5 streak: 320 PUMP</div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="game-button button-primary">
            Start Solo Game
          </button>
          <button className="game-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    switch (modal.type) {
      case 'rules':
        return renderRulesModal();
      case 'stats':
        return renderStatsModal();
      case 'solo-setup':
        return renderSoloSetupModal();
      default:
        return <div>Unknown modal type</div>;
    }
  };

  if (!modal) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>
            ❌
          </button>
        </div>
        
        {renderModal()}
        
        <div className="modal-actions">
          <button className="game-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModal; 