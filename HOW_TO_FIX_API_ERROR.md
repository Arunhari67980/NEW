# 🔧 How to Fix "Failed to load cryptocurrency data" Error

## Quick Fix Steps

### Step 1: Check Browser Console
1. Open your browser (Chrome/Edge/Firefox)
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look for error messages (they'll be in red)
5. **Copy the error message** - this tells us what's wrong

### Step 2: Test the API Directly

Open the browser console and paste this:

```javascript
fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=5')
  .then(r => r.json())
  .then(data => {
    console.log('✅ API WORKS!', data);
    alert('API is working! Check console for data.');
  })
  .catch(err => {
    console.error('❌ API ERROR:', err);
    alert('API Error: ' + err.message);
  });
```

**What this tells you:**
- ✅ If it works → The API is fine, issue is in the app
- ❌ If it fails → Network/CORS issue

### Step 3: Common Solutions

#### Solution A: Wait and Retry (Rate Limiting)
- **Problem**: CoinGecko free tier has rate limits (10-50 calls/min)
- **Fix**: 
  1. Wait 1-2 minutes
  2. Click the **"Retry"** button in the error message
  3. Or refresh the page

#### Solution B: Check Internet Connection
- **Problem**: No internet or unstable connection
- **Fix**:
  1. Check your WiFi/Ethernet connection
  2. Try loading another website
  3. Restart your router if needed

#### Solution C: Disable Browser Extensions
- **Problem**: Ad blockers or privacy extensions blocking API
- **Fix**:
  1. Open browser in **Incognito/Private mode** (Ctrl+Shift+N)
  2. Try the app there
  3. If it works, disable extensions one by one

#### Solution D: Clear Browser Cache
- **Problem**: Cached data causing issues
- **Fix**:
  1. Press **Ctrl+Shift+Delete** (or Cmd+Shift+Delete on Mac)
  2. Select "Cached images and files"
  3. Click "Clear data"
  4. Refresh the page

#### Solution E: Try Different Browser
- **Problem**: Browser-specific issue
- **Fix**: Try Chrome, Firefox, or Edge

### Step 4: Check Network Tab

1. Open Developer Tools (F12)
2. Click **Network** tab
3. Refresh the page
4. Look for requests to `api.coingecko.com`
5. Click on the request
6. Check:
   - **Status**: Should be 200 (green) or 429 (yellow - rate limit)
   - **Response**: Should show JSON data
   - **Headers**: Check for CORS errors

### Step 5: Check Firewall/Antivirus

- **Problem**: Security software blocking API calls
- **Fix**:
  1. Temporarily disable firewall/antivirus
  2. Try the app
  3. If it works, add exception for your browser

### Step 6: Use VPN or Different Network

- **Problem**: Network blocking external APIs
- **Fix**:
  1. Try mobile hotspot
  2. Use VPN
  3. Try different WiFi network

## Advanced Solutions

### Option 1: Use Mock Data (For Testing)

If API keeps failing, you can use mock data temporarily:

1. Create file: `src/utils/mockData.js`
2. Add sample coin data
3. Update `src/pages/Dashboard.jsx` to use mock data as fallback

### Option 2: Use CORS Proxy (If CORS Error)

If you see CORS errors in console:

1. The app now tries multiple methods automatically
2. If still failing, you may need a backend proxy
3. Or use a CORS proxy service (not recommended for production)

### Option 3: Check CoinGecko Status

Visit: https://status.coingecko.com/
- Check if CoinGecko API is down
- Look for maintenance announcements

## What Error Messages Mean

| Error | Meaning | Solution |
|-------|---------|----------|
| `Rate limit exceeded` | Too many API calls | Wait 1-2 minutes |
| `Failed to fetch` | Network/CORS issue | Check internet, try different network |
| `CORS policy` | Browser blocking request | Try different browser or network |
| `Timeout` | Request took too long | Check internet speed, try again |
| `404 Not Found` | API endpoint changed | Update app code |
| `429 Too Many Requests` | Rate limit | Wait and retry |

## Still Not Working?

### Get Help:

1. **Check Console**: Copy all red error messages
2. **Check Network Tab**: Screenshot failed requests
3. **Test API**: Run the test code from Step 2
4. **Share Details**: 
   - Browser name and version
   - Error messages from console
   - Network status (home, office, VPN?)
   - What you've already tried

### Quick Test Commands

**In Browser Console:**

```javascript
// Test 1: Basic connectivity
fetch('https://api.coingecko.com/api/v3/ping')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test 2: Get coins
fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=1')
  .then(r => r.json())
  .then(data => console.log('Coins:', data))
  .catch(err => console.error('Error:', err));
```

## Prevention Tips

1. **Don't refresh too often** - Wait between refreshes
2. **Use real-time updates** - Less API calls needed
3. **Check connection** - Stable internet helps
4. **Monitor rate limits** - CoinGecko free tier is limited

---

**The app now has automatic retry and multiple fallback methods. If it still fails, the issue is likely network-related or rate limiting.**

