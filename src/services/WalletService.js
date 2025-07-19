import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const PUMP_MINT = new PublicKey('3HfLqhtF5hR5dyBXh6BMtRaTm9qzStvEGuMa8Gx6pump');
// Use a public QuickNode endpoint for mainnet, or devnet for localhost/testing
const MAINNET_RPC = 'https://winter-wispy-brook.solana-mainnet.quiknode.pro/6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e/'; // Demo endpoint, replace for production
const DEVNET_RPC = clusterApiUrl('devnet');

export class WalletService {
  constructor() {
    const isDev = window.location.hostname === 'localhost';
    this.connection = new Connection(isDev ? DEVNET_RPC : MAINNET_RPC);
    this.isDev = isDev;
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
      throw new Error('Phantom wallet is not installed');
    }
    try {
      const resp = await window.solana.connect();
      const address = resp.publicKey.toString();
      const balanceLamports = await this.connection.getBalance(new PublicKey(address));
      const balance = balanceLamports / 1e9; // Convert lamports to SOL
      const tokenBalance = await this.fetchSplTokenBalance(address);
      this.connectedWallet = {
        connected: true,
        address,
        balance,
        tokenBalance,
        nickname: null
      };
      console.log('✅ Wallet connected:', this.connectedWallet);
      return this.connectedWallet;
    } catch (err) {
      throw new Error('User rejected wallet connection or Phantom not available');
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