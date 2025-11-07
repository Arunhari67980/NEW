import { Link } from 'react-router-dom';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice, formatPercentage, formatMarketCap } from '../utils/format';
import { isFavorite, toggleFavorite } from '../utils/localStorage';
import { useState } from 'react';

const CoinCard = ({ coin, onFavoriteToggle }) => {
  const [favorite, setFavorite] = useState(isFavorite(coin.id));

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavorites = toggleFavorite(coin.id);
    setFavorite(newFavorites.includes(coin.id));
    if (onFavoriteToggle) {
      onFavoriteToggle();
    }
  };

  const priceChange24h = coin.price_change_percentage_24h || 0;
  const isPositive = priceChange24h >= 0;

  return (
    <Link
      to={`/coin/${coin.id}`}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 group"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-12 h-12 rounded-full"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/48';
              }}
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                {coin.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                {coin.symbol}
              </p>
            </div>
          </div>
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-lg transition-colors ${
              favorite
                ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={20} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPrice(coin.current_price)}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">24h Change</p>
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="font-semibold">{formatPercentage(priceChange24h)}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Market Cap</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatMarketCap(coin.market_cap)}
            </p>
          </div>
        </div>

        {/* Rank Badge */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Rank #{coin.market_cap_rank || 'N/A'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isPositive
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {isPositive ? 'Bullish' : 'Bearish'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CoinCard;

