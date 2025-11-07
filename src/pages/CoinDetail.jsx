import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCoinDetails, fetchCoinHistory } from '../utils/api';
import { useRealtimePrice } from '../hooks/useRealtimePrice';
import { formatPrice, formatMarketCap, formatVolume, formatPercentage } from '../utils/format';
import { isFavorite, toggleFavorite } from '../utils/localStorage';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PriceAlert from '../components/PriceAlert';
import { Star, ArrowLeft, TrendingUp, TrendingDown, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CoinDetail = () => {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [timeRange, setTimeRange] = useState('7');

  // Real-time price updates
  const initialPrice = coin?.market_data?.current_price?.usd || null;
  const { price: realtimePrice, priceChange: realtimePriceChange, isConnected } = useRealtimePrice(
    id,
    initialPrice,
    !!id
  );

  useEffect(() => {
    if (id) {
      setFavorite(isFavorite(id));
    }
  }, [id]);

  useEffect(() => {
    const loadCoinData = async () => {
      try {
        setLoading(true);
        const [coinData, historyData] = await Promise.all([
          fetchCoinDetails(id),
          fetchCoinHistory(id, parseInt(timeRange)),
        ]);
        setCoin(coinData);
        setHistory(historyData);
        setError(null);
      } catch (err) {
        setError('Failed to load coin data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCoinData();
    }
  }, [id, timeRange]);

  // Update coin with real-time price
  useEffect(() => {
    if (coin && realtimePrice !== null) {
      setCoin((prevCoin) => ({
        ...prevCoin,
        market_data: {
          ...prevCoin.market_data,
          current_price: {
            ...prevCoin.market_data.current_price,
            usd: realtimePrice,
          },
          price_change_percentage_24h: realtimePriceChange !== null 
            ? realtimePriceChange 
            : prevCoin.market_data.price_change_percentage_24h,
        },
      }));
    }
  }, [realtimePrice, realtimePriceChange]);

  const handleFavoriteToggle = () => {
    const newFavorites = toggleFavorite(id);
    setFavorite(newFavorites.includes(id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error || !coin) {
    return <ErrorMessage message={error || 'Coin not found'} />;
  }

  // Prepare chart data
  const chartData = history
    ? {
        labels: history.prices.map((price) => {
          const date = new Date(price[0]);
          return timeRange <= 1
            ? date.toLocaleTimeString()
            : date.toLocaleDateString();
        }),
        datasets: [
          {
            label: 'Price (USD)',
            data: history.prices.map((price) => price[1]),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const priceChange24h = coin.market_data?.price_change_percentage_24h || 0;
  const isPositive = priceChange24h >= 0;

  const stats = [
    {
      label: 'Market Cap',
      value: formatMarketCap(coin.market_data?.market_cap?.usd),
    },
    {
      label: '24h Volume',
      value: formatVolume(coin.market_data?.total_volume?.usd),
    },
    {
      label: 'Circulating Supply',
      value: coin.market_data?.circulating_supply
        ? `${coin.market_data.circulating_supply.toLocaleString()} ${coin.symbol.toUpperCase()}`
        : 'N/A',
    },
    {
      label: 'Total Supply',
      value: coin.market_data?.total_supply
        ? `${coin.market_data.total_supply.toLocaleString()} ${coin.symbol.toUpperCase()}`
        : 'N/A',
    },
    {
      label: 'All-Time High',
      value: formatPrice(coin.market_data?.ath?.usd),
    },
    {
      label: 'All-Time Low',
      value: formatPrice(coin.market_data?.atl?.usd),
    },
  ];

  return (
    <div>
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      {/* Coin Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={coin.image?.large || coin.image?.small}
              alt={coin.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {coin.name}
                </h1>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-400 uppercase">
                  {coin.symbol}
                </span>
              </div>
              {coin.links?.homepage?.[0] && (
                <a
                  href={coin.links.homepage[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-blue-500 hover:text-blue-600 mt-2"
                >
                  <span>Website</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
          <button
            onClick={handleFavoriteToggle}
            className={`p-3 rounded-lg transition-colors ${
              favorite
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'text-gray-400 bg-gray-100 dark:bg-gray-700 hover:text-yellow-500'
            }`}
          >
            <Star size={24} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Price Section */}
        <div className="mb-6">
          <div className="flex items-baseline space-x-4 mb-2">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {formatPrice(coin.market_data?.current_price?.usd)}
            </p>
            <div className={`flex items-center space-x-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              <span className="text-xl font-semibold">
                {formatPercentage(priceChange24h)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Rank #{coin.market_cap_rank || 'N/A'}
            </p>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">REST</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {coin.description?.en && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {coin.description.en.substring(0, 500)}
              {coin.description.en.length > 500 && '...'}
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Price Chart</h2>
          <div className="flex space-x-2">
            {['1', '7', '30', '90', '365'].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === days
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {days === '1' ? '24H' : days === '365' ? '1Y' : `${days}D`}
              </button>
            ))}
          </div>
        </div>
        <div className="h-96">
          {chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </div>

      {/* Price Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <PriceAlert
          coinId={coin.id}
          coinName={coin.name}
          currentPrice={coin.market_data?.current_price?.usd}
        />
      </div>
    </div>
  );
};

export default CoinDetail;

