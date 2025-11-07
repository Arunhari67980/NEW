import { useEffect, useState } from 'react';
import { fetchGlobalStats } from '../utils/api';
import { formatMarketCap, formatPercentage } from '../utils/format';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const MarketStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchGlobalStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Failed to load market statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const marketCapChange = stats.market_cap_change_percentage_24h_usd || 0;
  const isPositive = marketCapChange >= 0;

  const statCards = [
    {
      label: 'Total Market Cap',
      value: formatMarketCap(stats.total_market_cap?.usd),
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: '24h Volume',
      value: formatMarketCap(stats.total_volume?.usd),
      icon: BarChart3,
      color: 'purple',
    },
    {
      label: 'Market Cap Change',
      value: formatPercentage(marketCapChange),
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'green' : 'red',
      isPercentage: true,
    },
    {
      label: 'Active Cryptocurrencies',
      value: stats.active_cryptocurrencies?.toLocaleString() || '0',
      icon: BarChart3,
      color: 'indigo',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = {
          blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
          purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
          green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
          red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
          indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        };

        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                <Icon size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
            <p
              className={`text-2xl font-bold ${
                stat.isPercentage && stat.color === 'green'
                  ? 'text-green-600 dark:text-green-400'
                  : stat.isPercentage && stat.color === 'red'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MarketStats;

