# ⚡ Quick Start: Real-Time API

## 🎯 What's New?

Your crypto tracker now has **real-time price updates** using WebSocket! Prices update instantly without page refresh.

## ✅ Already Integrated

The real-time API is **already integrated** in:
- ✅ Dashboard page (top 50 coins)
- ✅ Coin Detail page (individual coin)

## 🔍 How to See It Working

1. **Open the Dashboard**
   - Look for the green WiFi icon 🟢 = Real-time active
   - Prices will update automatically

2. **Check Connection Status**
   - Top of the search bar shows connection status
   - Green = WebSocket connected
   - Gray = Using REST API fallback

3. **Toggle Real-Time**
   - Click "Disable Real-time" button to switch to REST API only
   - Click "Enable Real-time" to turn it back on

## 📝 Using in Your Own Components

### Single Coin

```javascript
import { useRealtimePrice } from '../hooks/useRealtimePrice';

function MyCoinCard({ coinId, initialPrice }) {
  const { price, priceChange, isConnected } = useRealtimePrice(
    coinId,
    initialPrice,
    true // enabled
  );

  return (
    <div>
      <p>Price: ${price}</p>
      <p>Change: {priceChange}%</p>
      <p>{isConnected ? '🟢 Live' : '⚪ Offline'}</p>
    </div>
  );
}
```

### Multiple Coins

```javascript
import { useRealtimePrices } from '../hooks/useRealtimePrice';

function MyDashboard() {
  const coinIds = ['bitcoin', 'ethereum', 'solana'];
  const initialPrices = {
    bitcoin: { price: 50000, priceChange: 2.5 },
    ethereum: { price: 3000, priceChange: -1.2 },
  };

  const { prices, isConnected } = useRealtimePrices(
    coinIds,
    initialPrices,
    true
  );

  return (
    <div>
      {coinIds.map(id => (
        <div key={id}>
          <p>{id}: ${prices[id]?.price}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Direct WebSocket Usage

```javascript
import { cryptoWebSocket } from '../utils/websocket';

// Subscribe to updates
cryptoWebSocket.subscribe('bitcoin', (data) => {
  console.log('Bitcoin price:', data.current_price);
  console.log('24h change:', data.price_change_percentage_24h);
});

// Unsubscribe
cryptoWebSocket.unsubscribe('bitcoin');

// Check connection
if (cryptoWebSocket.isConnected()) {
  console.log('WebSocket is connected!');
}
```

## 🎨 Connection Status Indicator

Add this to any component:

```javascript
import { Wifi, WifiOff } from 'lucide-react';

function ConnectionStatus({ isConnected }) {
  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">REST</span>
        </>
      )}
    </div>
  );
}
```

## 🚨 Troubleshooting

### Not Connecting?

1. Check browser console for errors
2. Try disabling and re-enabling real-time
3. Refresh the page
4. Check your internet connection

### Prices Not Updating?

1. Verify the coin is supported (must be on Binance)
2. Check connection status indicator
3. Look for errors in browser console

### Want to Disable?

Simply set `enabled` to `false`:

```javascript
const { price } = useRealtimePrice(coinId, initialPrice, false);
```

## 📚 More Info

See `REALTIME_API_GUIDE.md` for complete documentation.

---

**That's it!** The real-time API is ready to use! 🎉

