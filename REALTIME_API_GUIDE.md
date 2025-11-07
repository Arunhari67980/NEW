# 🔴 Real-Time API Integration Guide

This guide explains how the real-time WebSocket API integration works in the Crypto Tracker app.

## 📡 Overview

The app now supports **real-time cryptocurrency price updates** using WebSocket connections. This provides instant price updates without constantly polling REST APIs.

## 🏗️ Architecture

### Current Implementation

1. **Primary**: WebSocket connection (Binance WebSocket - Free, no API key)
2. **Fallback**: REST API polling (CoinGecko - every 5 minutes)

### WebSocket Service

Located in `src/utils/websocket.js`:
- **CryptoWebSocket**: Uses Binance WebSocket API (free, no API key required)
- **CoinGeckoWebSocket**: Alternative using CoinGecko Pro (requires API key)

### React Hooks

Located in `src/hooks/useRealtimePrice.js`:
- `useRealtimePrice(coinId, initialPrice, enabled)`: Single coin updates
- `useRealtimePrices(coinIds, initialPrices, enabled)`: Multiple coins updates

## 🚀 How It Works

### 1. WebSocket Connection

```javascript
// Automatically connects when you subscribe to a coin
cryptoWebSocket.subscribe('bitcoin', (data) => {
  console.log('Bitcoin price:', data.current_price);
});
```

### 2. Using the Hook in Components

```javascript
import { useRealtimePrice } from '../hooks/useRealtimePrice';

const MyComponent = ({ coinId }) => {
  const { price, priceChange, isConnected } = useRealtimePrice(
    coinId,
    initialPrice,
    true // enabled
  );

  return (
    <div>
      <p>Price: ${price}</p>
      <p>Status: {isConnected ? 'Live' : 'Offline'}</p>
    </div>
  );
};
```

### 3. Multiple Coins

```javascript
import { useRealtimePrices } from '../hooks/useRealtimePrice';

const Dashboard = () => {
  const coinIds = ['bitcoin', 'ethereum', 'solana'];
  const { prices, isConnected } = useRealtimePrices(coinIds, initialPrices);

  // prices = {
  //   bitcoin: { price: 50000, priceChange: 2.5 },
  //   ethereum: { price: 3000, priceChange: -1.2 },
  //   ...
  // }
};
```

## 🔧 Configuration

### Binance WebSocket (Default - Free)

✅ **Pros:**
- Free, no API key required
- Very fast updates
- Reliable connection
- Supports major cryptocurrencies

❌ **Cons:**
- Limited to coins available on Binance
- Requires symbol mapping (CoinGecko ID → Binance symbol)

### CoinGecko Pro WebSocket (Optional)

To use CoinGecko Pro WebSocket:

1. Get API key from [CoinGecko Pro](https://www.coingecko.com/en/api/pricing)
2. Update `src/utils/websocket.js`:

```javascript
import { CoinGeckoWebSocket } from '../utils/websocket';

const coinGeckoWS = new CoinGeckoWebSocket('YOUR_API_KEY');
coinGeckoWS.connect();
coinGeckoWS.subscribe('bitcoin', (data) => {
  // Handle updates
});
```

## 📊 Current Integration

### Dashboard (`src/pages/Dashboard.jsx`)

- ✅ Real-time updates for top 50 coins
- ✅ Connection status indicator
- ✅ Toggle to enable/disable real-time
- ✅ Automatic fallback to REST API

### Coin Detail (`src/pages/CoinDetail.jsx`)

- ✅ Real-time price updates
- ✅ Live price change percentage
- ✅ Connection status indicator

## 🎯 Features

### Automatic Reconnection

The WebSocket service automatically reconnects if the connection drops:
- Max 5 reconnection attempts
- Exponential backoff (3s, 6s, 9s, 12s, 15s)

### Connection Status

Visual indicators show:
- 🟢 **Green WiFi icon**: Real-time updates active
- ⚪ **Gray WiFi icon**: Using REST API fallback

### Performance

- Limits to top 50 coins for performance
- Efficient subscription management
- Automatic cleanup on unmount

## 🔄 Symbol Mapping

The app includes a mapping of CoinGecko coin IDs to Binance symbols:

```javascript
const symbolMap = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'solana': 'SOL',
  // ... more mappings
};
```

### Adding New Coins

To add support for a new coin:

1. Find the Binance trading pair (e.g., `ADAUSDT`)
2. Add to `coinIdToSymbol()` in `src/utils/websocket.js`:

```javascript
coinIdToSymbol(coinId) {
  const symbolMap = {
    // ... existing mappings
    'cardano': 'ADA',  // Add new mapping
  };
  return symbolMap[coinId.toLowerCase()] || null;
}
```

## 🛠️ Troubleshooting

### WebSocket Not Connecting

1. **Check browser console** for errors
2. **Verify network** - WebSocket requires stable connection
3. **Check firewall** - Some networks block WebSocket connections
4. **Try disabling real-time** - App will fallback to REST API

### Prices Not Updating

1. **Check connection status** - Look for green WiFi icon
2. **Verify coin symbol** - Coin must be available on Binance
3. **Check console** - Look for WebSocket errors
4. **Refresh page** - Reconnect WebSocket

### High CPU Usage

- **Reduce coin count** - Limit to fewer coins in Dashboard
- **Disable real-time** - Use REST API only
- **Check for memory leaks** - Ensure components unmount properly

## 📈 Performance Tips

1. **Limit subscriptions**: Only subscribe to coins currently visible
2. **Use debouncing**: For high-frequency updates
3. **Batch updates**: Update state in batches, not per message
4. **Cleanup**: Always unsubscribe when component unmounts

## 🔐 Security

- WebSocket connections are **read-only** (no API keys needed for Binance)
- No sensitive data transmitted
- All connections use **WSS** (secure WebSocket)

## 📚 Additional Resources

- [Binance WebSocket API Docs](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-data)
- [CoinGecko Pro API](https://www.coingecko.com/en/api/pricing)
- [WebSocket MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 🎉 Benefits

✅ **Instant Updates**: Prices update in real-time
✅ **Reduced API Calls**: No need to poll REST API constantly
✅ **Better UX**: Users see live price movements
✅ **Lower Latency**: WebSocket is faster than HTTP polling
✅ **Free**: Binance WebSocket is free to use

---

**Note**: The app gracefully falls back to REST API if WebSocket fails, ensuring it always works!

