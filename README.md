# 🚀 Crypto Tracker - Real-time Cryptocurrency Dashboard

A modern, feature-rich cryptocurrency tracking application built with React, Tailwind CSS, and Chart.js. Track real-time prices, manage your portfolio, and stay updated with the latest crypto news.

## ✨ Features

### Core Features
- **📊 Real-time Price Updates** - Live cryptocurrency prices from CoinGecko API
- **⭐ Favorites System** - Save your favorite coins with local storage
- **📈 Interactive Charts** - Price trends with Chart.js (1D, 7D, 30D, 90D, 1Y)
- **🔍 Advanced Search & Filter** - Search by name/symbol, filter by gainers/losers
- **📱 Responsive Design** - Beautiful UI that works on all devices
- **🌓 Dark/Light Mode** - Toggle between themes with system preference detection

### Advanced Features
- **💼 Portfolio Tracking** - Track your investments with P&L calculations
- **📰 Crypto News** - Latest news from CryptoPanic API
- **📊 Market Statistics** - Global market cap, volume, and trends
- **🔥 Trending Coins** - See what's hot in the crypto market
- **🎯 Coin Details** - Comprehensive coin information with charts
- **🔄 Auto-refresh** - Automatic data updates every minute

## 🛠️ Tech Stack

- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Charting library for data visualization
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icon library
- **Vite** - Fast build tool and dev server

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crypto-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🚀 Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📡 API Configuration

### CoinGecko API
The app uses the free CoinGecko API which doesn't require an API key. Rate limits apply:
- 10-50 calls/minute for the free tier

### CryptoPanic API (Optional)
For the News feature, you can optionally configure a CryptoPanic API key:

1. Sign up at [cryptopanic.com](https://cryptopanic.com/developers/api/)
2. Get your API key
3. Update `src/utils/api.js`:
   ```javascript
   const response = await axios.get(`${CRYPTOPANIC_API}/posts/`, {
     params: {
       auth_token: 'YOUR_API_KEY_HERE',
       public: true,
       page: page,
     },
   });
   ```

## 📁 Project Structure

```
crypto-tracker/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── CoinCard.jsx
│   │   ├── MarketStats.jsx
│   │   ├── TrendingCoins.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorMessage.jsx
│   ├── pages/           # Page components
│   │   ├── Dashboard.jsx
│   │   ├── CoinDetail.jsx
│   │   ├── Favorites.jsx
│   │   ├── Portfolio.jsx
│   │   └── News.jsx
│   ├── utils/           # Utility functions
│   │   ├── api.js       # API calls
│   │   ├── localStorage.js
│   │   ├── theme.js
│   │   └── format.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Features Breakdown

### Dashboard
- View all cryptocurrencies with real-time prices
- Search and filter functionality
- Sort by market cap, price, or 24h change
- Market statistics overview
- Trending coins sidebar

### Coin Detail Page
- Comprehensive coin information
- Interactive price charts (multiple timeframes)
- Market statistics
- Favorite toggle
- Links to official website

### Favorites
- View all your favorite coins in one place
- Quick access to coin details
- Real-time price updates

### Portfolio
- Add coins with buy price and amount
- Automatic P&L calculation
- Total portfolio value
- Individual coin performance tracking

### News
- Latest cryptocurrency news
- Source attribution
- Time-based sorting

## 🔧 Customization

### Theme Colors
Edit `tailwind.config.js` to customize the color scheme.

### API Endpoints
Modify `src/utils/api.js` to change API endpoints or add new data sources.

### Update Intervals
Adjust the `setInterval` values in components to change auto-refresh rates.

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 🙏 Acknowledgments

- [CoinGecko](https://www.coingecko.com/) for the free cryptocurrency API
- [CryptoPanic](https://cryptopanic.com/) for crypto news API
- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

Made with ❤️ using React and Tailwind CSS

