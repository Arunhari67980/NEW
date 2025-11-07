# 🔧 Troubleshooting Guide

## "Failed to load cryptocurrency data" Error

If you're seeing this error, here are steps to fix it:

### 1. Check Internet Connection

- Ensure you have an active internet connection
- Try opening `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd` in your browser
- If it doesn't load, there's a network issue

### 2. Check Browser Console

Open browser DevTools (F12) and check the Console tab for detailed error messages:
- **CORS errors**: May need a proxy or different API
- **429 errors**: Rate limit exceeded - wait a few minutes
- **Network errors**: Connection issues

### 3. CoinGecko API Rate Limits

The free CoinGecko API has rate limits:
- **10-50 calls/minute** depending on your IP
- If you exceed this, wait 1-2 minutes and try again

### 4. Try These Solutions

#### Solution 1: Wait and Retry
- Click the **"Retry"** button in the error message
- Wait 30-60 seconds if rate limited

#### Solution 2: Check API Status
Visit: https://www.coingecko.com/en/api
- Check if CoinGecko API is operational
- Look for any service announcements

#### Solution 3: Use a Proxy (Advanced)
If CORS is blocking, you may need to:
1. Use a CORS proxy service
2. Or set up your own backend proxy

#### Solution 4: Clear Browser Cache
- Clear browser cache and cookies
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### 5. Test API Directly

Open your browser console and run:

```javascript
fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=10')
  .then(r => r.json())
  .then(data => console.log('API works!', data))
  .catch(err => console.error('API error:', err));
```

If this fails, the issue is with CoinGecko API or your network.

### 6. Alternative: Use Mock Data

If API continues to fail, you can temporarily use mock data:

1. Create `src/utils/mockData.js`:

```javascript
export const mockCoins = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    current_price: 50000,
    price_change_percentage_24h: 2.5,
    market_cap: 1000000000000,
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  // Add more mock coins...
];
```

2. Update `src/pages/Dashboard.jsx` to use mock data as fallback.

### 7. Check Firewall/Antivirus

- Some firewalls block API requests
- Temporarily disable to test
- Add exception for your browser

### 8. Network-Specific Issues

#### Corporate/University Networks
- May block external API calls
- Contact IT for API whitelist
- Or use a VPN

#### VPN Issues
- Some VPNs block certain APIs
- Try disconnecting VPN
- Or switch VPN server location

### 9. Browser-Specific Issues

#### Chrome/Edge
- Check if extensions are blocking requests
- Try incognito mode
- Disable ad blockers temporarily

#### Firefox
- Check privacy settings
- Disable strict tracking protection for testing

### 10. Development Server Issues

If using Vite dev server:
- Restart the dev server: `npm run dev`
- Check if port 5173 is accessible
- Try a different port: `npm run dev -- --port 3000`

## Common Error Messages

### "Rate limit exceeded"
- **Solution**: Wait 1-2 minutes, then retry
- **Prevention**: Reduce API call frequency

### "No response from server"
- **Solution**: Check internet connection
- **Solution**: Check if CoinGecko is down

### "CORS policy"
- **Solution**: Use a proxy or backend
- **Solution**: CoinGecko API should support CORS, check browser

### "Network Error"
- **Solution**: Check internet connection
- **Solution**: Check firewall settings
- **Solution**: Try different network

## Still Not Working?

1. **Check the browser console** for specific error details
2. **Test the API directly** in browser (see Solution 5)
3. **Check CoinGecko status**: https://status.coingecko.com/
4. **Try a different network** (mobile hotspot, etc.)
5. **Contact support** with error details from console

## Getting Help

When asking for help, provide:
- Browser console error messages
- Network tab screenshots
- Your network setup (corporate, home, VPN, etc.)
- Steps you've already tried

---

**Note**: The app now includes automatic retry logic and better error messages. If errors persist, the issue is likely network-related or API rate limiting.

