import React from 'react';

const GameHeader = ({ walletState, onWalletConnect, onWalletDisconnect, gameState, onAirdrop, isDevnet }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="game-header">
      <div className="header-left">
        <h1>🎲 High Stakes Coin Flip Showdown</h1>
        <p className="game-subtitle">
          {gameState.mode === 'lobby' && 'Ready to test your luck?'}
          {gameState.mode === 'multiplayer' && `Multiplayer Game - ${gameState.players?.length || 0} players`}
          {gameState.mode === 'solo' && 'Solo Mode - Player vs House'}
          {gameState.mode === 'finished' && 'Game Finished!'}
        </p>
      </div>
      
      <div className="header-right">
        <div className="wallet-connect">
          {walletState.connected ? (
            <div className="wallet-info">
              <div className="balance-display">
                <span className="token-balance">{walletState.tokenBalance || 0} SPL Token</span>
                <span className="sol-balance">{walletState.balance || 0} SOL</span>
              </div>
              <div className="wallet-address">
                {formatAddress(walletState.address)}
              </div>
              <button 
                className="wallet-button" 
                onClick={onWalletDisconnect}
              >
                Disconnect
              </button>
              {isDevnet && (
                <button
                  className="wallet-button"
                  style={{ marginLeft: 8 }}
                  onClick={onAirdrop}
                >
                  Airdrop 1 SOL (devnet)
                </button>
              )}
            </div>
          ) : (
            <div className="wallet-disconnected">
              <button 
                className="wallet-button"
                onClick={onWalletConnect}
              >
                Connect Wallet
              </button>
              <p className="connect-prompt">Connect wallet to play</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHeader; 