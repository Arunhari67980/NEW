import { useState, useEffect } from 'react';
import { fetchCoins } from '../utils/api';
import { getFavorites } from '../utils/localStorage';
import CoinCard from '../components/CoinCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Star } from 'lucide-react';

const Favorites = () => {
  const [favoriteCoins, setFavoriteCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoriteIds = getFavorites();
      
      if (favoriteIds.length === 0) {
        setFavoriteCoins([]);
        setLoading(false);
        return;
      }

      // Fetch all coins and filter favorites
      const allCoins = await fetchCoins(1, 250);
      const favorites = allCoins.filter((coin) => favoriteIds.includes(coin.id));
      setFavoriteCoins(favorites);
      setError(null);
    } catch (err) {
      setError('Failed to load favorite coins. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
    const interval = setInterval(loadFavorites, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleFavoriteToggle = () => {
    loadFavorites();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <Star className="w-8 h-8 text-yellow-500" fill="currentColor" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Favorite Coins</h1>
      </div>

      {favoriteCoins.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
          <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No favorites yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start adding coins to your favorites by clicking the star icon on any coin card.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favoriteCoins.map((coin) => (
            <CoinCard key={coin.id} coin={coin} onFavoriteToggle={handleFavoriteToggle} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;

