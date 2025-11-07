import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrendingCoins } from '../utils/api';
import { TrendingUp, Sparkles } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { formatPrice, formatPercentage } from '../utils/format';

const TrendingCoins = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        setLoading(true);
        const data = await fetchTrendingCoins();
        setTrending(data.slice(0, 5)); // Top 5 trending
      } catch (error) {
        console.error('Error loading trending coins:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrending();
    const interval = setInterval(loadTrending, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Trending Coins</h2>
      </div>
      <div className="space-y-3">
        {trending.map((item, index) => (
          <Link
            key={item.item.id}
            to={`/coin/${item.item.id}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                {index + 1}
              </div>
              <img
                src={item.item.small}
                alt={item.item.name}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/32';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">
                  {item.item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                  {item.item.symbol}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {item.item.data?.price_change_percentage_24h?.usd && (
                <div className="flex items-center space-x-1 text-green-500">
                  <TrendingUp size={14} />
                  <span className="text-sm font-semibold">
                    {formatPercentage(item.item.data.price_change_percentage_24h.usd)}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingCoins;

