import { useState, useEffect, useCallback } from 'react';
import { fetchCoins } from '../utils/api';
import { useRealtimePrices } from '../hooks/useRealtimePrice';
import CoinCard from '../components/CoinCard';
import MarketStats from '../components/MarketStats';
import TrendingCoins from '../components/TrendingCoins';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Search, Filter, ArrowUpDown, Wifi, WifiOff } from 'lucide-react';

const Dashboard = () => {
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('market_cap_desc');
  const [filterBy, setFilterBy] = useState('all');
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  // Get coin IDs for real-time updates
  const coinIds = coins.map(coin => coin.id).slice(0, 50); // Limit to top 50 for performance
  const initialPrices = coins.reduce((acc, coin) => {
    acc[coin.id] = {
      price: coin.current_price,
      priceChange: coin.price_change_percentage_24h,
    };
    return acc;
  }, {});

  // Real-time price updates
  const { prices: realtimePrices, isConnected } = useRealtimePrices(
    coinIds,
    initialPrices,
    realtimeEnabled
  );

  // Load initial data from REST API
  const loadCoins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log API call for debugging
      console.log('🔄 Fetching coins from CoinGecko API...');
      
      const data = await fetchCoins(1, 100);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('API returned empty or invalid data');
      }
      
      console.log(`✅ Successfully loaded ${data.length} coins`);
      setCoins(data);
      setFilteredCoins(data);
      setError(null);
    } catch (err) {
      // Use the error message from the API if available
      const errorMessage = err.message || 'Failed to load cryptocurrency data. Please try again later.';
      setError(errorMessage);
      console.error('❌ Error loading coins:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoins();
    // Fallback: Update every 5 minutes if WebSocket fails
    const interval = setInterval(loadCoins, 300000);
    return () => clearInterval(interval);
  }, [loadCoins]);

  // Update coins with real-time prices
  useEffect(() => {
    if (Object.keys(realtimePrices).length > 0) {
      setCoins((prevCoins) =>
        prevCoins.map((coin) => {
          const realtimeData = realtimePrices[coin.id];
          if (realtimeData) {
            return {
              ...coin,
              current_price: realtimeData.price || coin.current_price,
              price_change_percentage_24h:
                realtimeData.priceChange !== undefined
                  ? realtimeData.priceChange
                  : coin.price_change_percentage_24h,
            };
          }
          return coin;
        })
      );
    }
  }, [realtimePrices]);

  useEffect(() => {
    let filtered = [...coins];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (coin) =>
          coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price change filter
    if (filterBy === 'gainers') {
      filtered = filtered.filter((coin) => coin.price_change_percentage_24h > 0);
    } else if (filterBy === 'losers') {
      filtered = filtered.filter((coin) => coin.price_change_percentage_24h < 0);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'market_cap_desc':
          return (b.market_cap || 0) - (a.market_cap || 0);
        case 'market_cap_asc':
          return (a.market_cap || 0) - (b.market_cap || 0);
        case 'price_desc':
          return (b.current_price || 0) - (a.current_price || 0);
        case 'price_asc':
          return (a.current_price || 0) - (b.current_price || 0);
        case 'change_desc':
          return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0);
        case 'change_asc':
          return (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0);
        default:
          return 0;
      }
    });

    setFilteredCoins(filtered);
  }, [coins, searchQuery, sortBy, filterBy]);

  const handleFavoriteToggle = () => {
    // Force re-render if needed
  };

  if (loading && coins.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error && coins.length === 0) {
    return <ErrorMessage message={error} onRetry={loadCoins} />;
  }

  return (
    <div>
      {/* Market Stats */}
      <MarketStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Trending Sidebar */}
        <div className="lg:col-span-1">
          <TrendingCoins />
        </div>

        {/* Main Coin List */}
        <div className="lg:col-span-3">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
            {/* Real-time Status */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Real-time updates active
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Using REST API (fallback mode)
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setRealtimeEnabled(!realtimeEnabled)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  realtimeEnabled
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {realtimeEnabled ? 'Disable' : 'Enable'} Real-time
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="market_cap_desc">Market Cap (High to Low)</option>
                  <option value="market_cap_asc">Market Cap (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="change_desc">24h Change (High to Low)</option>
                  <option value="change_asc">24h Change (Low to High)</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>

              {/* Filter */}
              <div className="relative">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Coins</option>
                  <option value="gainers">Top Gainers</option>
                  <option value="losers">Top Losers</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredCoins.length} of {coins.length} cryptocurrencies
            </div>
          </div>

          {/* Coins Grid */}
          {loading && coins.length > 0 ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredCoins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCoins.map((coin) => (
                <CoinCard key={coin.id} coin={coin} onFavoriteToggle={handleFavoriteToggle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <p className="text-gray-600 dark:text-gray-400">No cryptocurrencies found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

