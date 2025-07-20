import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const PUMP_MINT = new PublicKey('3HfLqhtF5hR5dyBXh6BMtRaTm9qzStvEGuMa8Gx6pump');

// Multiple RPC endpoints for better reliability
const MAINNET_RPCS = [
  'https://solana-api.projectserum.com',
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana'
];
const DEVNET_RPC = clusterApiUrl('devnet');

export class WalletService {
  constructor() {
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname.includes('127.0.0.1') ||
                  window.location.hostname.includes('dev.fun');
    
    // For production, try mainnet first, fallback to devnet if needed
    if (isDev) {
      this.connection = new Connection(DEVNET_RPC);
      this.isDev = true;
    } else {
      // Try to create connection with first mainnet RPC
      try {
        this.connection = new Connection(MAINNET_RPCS[0]);
        this.isDev = false;
      } catch (error) {
        console.warn('Mainnet connection failed, falling back to devnet:', error);
        this.connection = new Connection(DEVNET_RPC);
        this.isDev = true;
      }
    }
    
    this.connectedWallet = null;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    console.log('💳 WalletService initialized');
    this.initialized = true;
  }

  // Helper to fetch SPL token balance
  async fetchSplTokenBalance(ownerAddress, mint = PUMP_MINT) {
    const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
      new PublicKey(ownerAddress),
      { mint }
    );
    let amount = 0;
    if (tokenAccounts.value.length > 0) {
      amount = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    }
    return amount;
  }

  // Connect to Phantom wallet
  async connect() {
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet is not installed. Please install Phantom wallet extension.');
    }
    
    try {
      console.log('🔗 Attempting wallet connection...');
      const resp = await window.solana.connect();
      const address = resp.publicKey.toString();
      
      // Try to get balance with retry logic
      let balance = 0;
      let tokenBalance = 0;
      
      try {
        const balanceLamports = await this.connection.getBalance(new PublicKey(address));
        balance = balanceLamports / 1e9; // Convert lamports to SOL
        console.log(`💰 SOL Balance: ${balance}`);
      } catch (balanceError) {
        console.warn('⚠️ Could not fetch SOL balance:', balanceError.message);
      }
      
      try {
        tokenBalance = await this.fetchSplTokenBalance(address);
        console.log(`🪙 PUMP Balance: ${tokenBalance}`);
      } catch (tokenError) {
        console.warn('⚠️ Could not fetch PUMP balance:', tokenError.message);
      }
      
      this.connectedWallet = {
        connected: true,
        address,
        balance,
        tokenBalance,
        nickname: null
      };
      
      console.log('✅ Wallet connected successfully:', this.connectedWallet.address);
      return this.connectedWallet;
      
    } catch (err) {
      console.error('❌ Wallet connection error:', err);
      if (err.message.includes('User rejected')) {
        throw new Error('Connection cancelled by user');
      } else {
        throw new Error('Phantom wallet connection failed. Please try again.');
      }
    }
  }

  // Disconnect wallet (just clear state)
  async disconnect() {
    if (window.solana && window.solana.isPhantom) {
      try { await window.solana.disconnect(); } catch (e) {}
    }
    this.connectedWallet = null;
    console.log('❌ Wallet disconnected');
  }

  // Get current wallet info
  getWalletInfo() {
    return this.connectedWallet;
  }

  // Update balance (SOL and token)
  async updateBalance(address) {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    const balanceLamports = await this.connection.getBalance(new PublicKey(address));
    const balance = balanceLamports / 1e9;
    const tokenBalance = await this.fetchSplTokenBalance(address);
    this.connectedWallet.balance = balance;
    this.connectedWallet.tokenBalance = tokenBalance;
    return {
      balance: this.connectedWallet.balance,
      tokenBalance: this.connectedWallet.tokenBalance
    };
  }

  // Airdrop SOL (devnet only)
  async airdropSol(address, amount = 1) {
    if (!this.isDev) throw new Error('Airdrop only available on devnet');
    const sig = await this.connection.requestAirdrop(new PublicKey(address), amount * 1e9);
    await this.connection.confirmTransaction(sig);
    return sig;
  }

  // Utility: is wallet connected?
  isConnected() {
    return this.connectedWallet !== null;
  }

  // Utility: get connected address
  getConnectedAddress() {
    return this.connectedWallet?.address || null;
  }

  // Utility: format address for display
  formatAddress(address) {
    if (!address) return '';
    if (address.length <= 8) return address;
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  }
} 