import { useState, useEffect } from 'react';
import { fetchCoins } from '../utils/api';
import { getPortfolio, savePortfolio, removeFromPortfolio } from '../utils/localStorage';
import { formatPrice, formatPercentage } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', amount: '', buyPrice: '' });

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const savedPortfolio = getPortfolio();
      setPortfolio(savedPortfolio);

      if (savedPortfolio.length === 0) {
        setPortfolioData([]);
        setLoading(false);
        return;
      }

      // Fetch current prices for portfolio coins
      const allCoins = await fetchCoins(1, 250);
      const data = savedPortfolio.map((item) => {
        const coin = allCoins.find((c) => c.id === item.id);
        if (!coin) return null;

        const currentValue = item.amount * coin.current_price;
        const buyValue = item.amount * item.buyPrice;
        const profit = currentValue - buyValue;
        const profitPercentage = ((currentValue - buyValue) / buyValue) * 100;

        return {
          ...item,
          coin,
          currentValue,
          buyValue,
          profit,
          profitPercentage,
        };
      }).filter(Boolean);

      setPortfolioData(data);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoin = async () => {
    if (!formData.id || !formData.amount || !formData.buyPrice) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const allCoins = await fetchCoins(1, 250);
      const coin = allCoins.find((c) => c.id === formData.id.toLowerCase());

      if (!coin) {
        alert('Coin not found. Please check the coin ID.');
        return;
      }

      const newItem = {
        id: formData.id.toLowerCase(),
        amount: parseFloat(formData.amount),
        buyPrice: parseFloat(formData.buyPrice),
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
      };

      const updatedPortfolio = [...getPortfolio(), newItem];
      savePortfolio(updatedPortfolio);
      setFormData({ id: '', amount: '', buyPrice: '' });
      setShowAddForm(false);
      loadPortfolio();
    } catch (error) {
      alert('Failed to add coin to portfolio');
      console.error(error);
    }
  };

  const handleRemoveCoin = (coinId) => {
    if (window.confirm('Are you sure you want to remove this coin from your portfolio?')) {
      removeFromPortfolio(coinId);
      loadPortfolio();
    }
  };

  const totalValue = portfolioData.reduce((sum, item) => sum + item.currentValue, 0);
  const totalBuyValue = portfolioData.reduce((sum, item) => sum + item.buyValue, 0);
  const totalProfit = totalValue - totalBuyValue;
  const totalProfitPercentage = totalBuyValue > 0 ? (totalProfit / totalBuyValue) * 100 : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          <span>Add Coin</span>
        </button>
      </div>

      {/* Add Coin Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Coin to Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Coin ID (e.g., bitcoin, ethereum)
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="bitcoin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.5"
                step="any"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buy Price (USD)
              </label>
              <input
                type="number"
                value={formData.buyPrice}
                onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50000"
                step="any"
              />
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleAddCoin}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Coin
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({ id: '', amount: '', buyPrice: '' });
              }}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Summary */}
      {portfolioData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-6 h-6 text-blue-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(totalValue)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-6 h-6 text-gray-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Invested</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(totalBuyValue)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              {totalProfit >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-500" />
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">Total P&L</p>
            </div>
            <p
              className={`text-2xl font-bold ${
                totalProfit >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatPrice(totalProfit)} ({formatPercentage(totalProfitPercentage)})
            </p>
          </div>
        </div>
      )}

      {/* Portfolio List */}
      {portfolioData.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Your portfolio is empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking your cryptocurrency investments by adding coins to your portfolio.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Coin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Buy Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {portfolioData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                            {item.symbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatPrice(item.buyPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatPrice(item.coin.current_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatPrice(item.currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-semibold ${
                          item.profit >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {formatPrice(item.profit)} ({formatPercentage(item.profitPercentage)})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRemoveCoin(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;

