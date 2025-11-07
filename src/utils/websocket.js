// WebSocket service for real-time cryptocurrency price updates
// Using Binance WebSocket API (free, no API key required)

class CryptoWebSocket {
  constructor() {
    this.ws = null;
    this.subscriptions = new Map(); // coinId -> callback
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnecting = false;
  }

  // Convert CoinGecko coin ID to Binance symbol
  coinIdToSymbol(coinId) {
    const symbolMap = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binancecoin': 'BNB',
      'ripple': 'XRP',
      'cardano': 'ADA',
      'solana': 'SOL',
      'polkadot': 'DOT',
      'dogecoin': 'DOGE',
      'matic-network': 'MATIC',
      'litecoin': 'LTC',
      'chainlink': 'LINK',
      'bitcoin-cash': 'BCH',
      'stellar': 'XLM',
      'ethereum-classic': 'ETC',
      'filecoin': 'FIL',
      'tron': 'TRX',
      'eos': 'EOS',
      'monero': 'XMR',
      'cosmos': 'ATOM',
      'tezos': 'XTZ',
      'avalanche-2': 'AVAX',
      'algorand': 'ALGO',
      'aave': 'AAVE',
      'uniswap': 'UNI',
      'maker': 'MKR',
      'compound-governance-token': 'COMP',
      'the-graph': 'GRT',
      'theta-token': 'THETA',
      'vechain': 'VET',
      'internet-computer': 'ICP',
      'fantom': 'FTM',
      'decentraland': 'MANA',
      'axie-infinity': 'AXS',
      'the-sandbox': 'SAND',
      'gala': 'GALA',
      'enjincoin': 'ENJ',
      'flow': 'FLOW',
      'near': 'NEAR',
      'aptos': 'APT',
      'optimism': 'OP',
      'arbitrum': 'ARB',
    };

    return symbolMap[coinId.toLowerCase()] || null;
  }

  // Connect to WebSocket
  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      // Binance WebSocket for ticker prices
      this.ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.reconnect();
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      this.isConnecting = false;
      this.reconnect();
    }
  }

  // Handle incoming messages
  handleMessage(data) {
    if (Array.isArray(data)) {
      // Binance ticker array format: !ticker@arr
      // Each ticker has: s (symbol), c (last price), P (24h price change %)
      data.forEach((ticker) => {
        if (!ticker || !ticker.s) return;
        
        const symbol = ticker.s; // e.g., "BTCUSDT"
        const price = parseFloat(ticker.c || 0); // Last price
        const priceChange = parseFloat(ticker.P || 0); // 24h price change percentage

        // Extract base symbol (remove USDT suffix)
        const baseSymbol = symbol.replace('USDT', '');

        // Find all subscriptions that match this symbol
        this.subscriptions.forEach((callback, coinId) => {
          const expectedSymbol = this.coinIdToSymbol(coinId);
          if (expectedSymbol && baseSymbol === expectedSymbol) {
            callback({
              id: coinId,
              symbol: expectedSymbol,
              current_price: price,
              price_change_percentage_24h: priceChange,
              last_updated: new Date().toISOString(),
            });
          }
        });
      });
    } else if (data.s) {
      // Single ticker update format
      const symbol = data.s;
      const price = parseFloat(data.c || 0);
      const priceChange = parseFloat(data.P || 0);
      const baseSymbol = symbol.replace('USDT', '');

      this.subscriptions.forEach((callback, coinId) => {
        const expectedSymbol = this.coinIdToSymbol(coinId);
        if (expectedSymbol && baseSymbol === expectedSymbol) {
          callback({
            id: coinId,
            symbol: expectedSymbol,
            current_price: price,
            price_change_percentage_24h: priceChange,
            last_updated: new Date().toISOString(),
          });
        }
      });
    }
  }

  // Subscribe to a coin's price updates
  subscribe(coinId, callback) {
    this.subscriptions.set(coinId, callback);

    // Connect if not already connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    }
  }

  // Unsubscribe from a coin's price updates
  unsubscribe(coinId) {
    this.subscriptions.delete(coinId);

    // Close connection if no subscriptions
    if (this.subscriptions.size === 0 && this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Reconnect logic
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // Disconnect
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.isConnecting = false;
  }

  // Get connection status
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const cryptoWebSocket = new CryptoWebSocket();

// Alternative: CoinGecko WebSocket (requires Pro API key)
export class CoinGeckoWebSocket {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.ws = null;
    this.subscriptions = new Map();
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    // CoinGecko Pro WebSocket endpoint
    this.ws = new WebSocket(`wss://ws.coingecko.com/v3?x_cg_pro_api_key=${this.apiKey}`);

    this.ws.onopen = () => {
      console.log('CoinGecko WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing CoinGecko WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('CoinGecko WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('CoinGecko WebSocket disconnected');
      setTimeout(() => this.connect(), 3000);
    };
  }

  handleMessage(data) {
    // Handle CoinGecko WebSocket message format
    if (data.type === 'price') {
      const callback = this.subscriptions.get(data.coin_id);
      if (callback) {
        callback(data);
      }
    }
  }

  subscribe(coinId, callback) {
    this.subscriptions.set(coinId, callback);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    }

    // Subscribe message format for CoinGecko
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        coin_id: coinId,
      }));
    }
  }

  unsubscribe(coinId) {
    this.subscriptions.delete(coinId);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        coin_id: coinId,
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }
}

