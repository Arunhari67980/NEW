import { useState, useEffect } from 'react';
import { fetchCryptoNews } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Newspaper, ExternalLink, Calendar } from 'lucide-react';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const data = await fetchCryptoNews();
        setNews(data);
        setError(null);
      } catch (err) {
        setError('Failed to load crypto news. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
    const interval = setInterval(loadNews, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

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

  // Mock news data if API fails
  const mockNews = [
    {
      id: 1,
      title: 'Bitcoin Reaches New All-Time High',
      source: 'CryptoNews',
      published_at: new Date().toISOString(),
      url: '#',
      metadata: { source: 'CryptoNews' },
    },
    {
      id: 2,
      title: 'Ethereum 2.0 Staking Reaches Milestone',
      source: 'CoinDesk',
      published_at: new Date(Date.now() - 3600000).toISOString(),
      url: '#',
      metadata: { source: 'CoinDesk' },
    },
    {
      id: 3,
      title: 'DeFi Total Value Locked Surpasses $100B',
      source: 'DeFi Pulse',
      published_at: new Date(Date.now() - 7200000).toISOString(),
      url: '#',
      metadata: { source: 'DeFi Pulse' },
    },
  ];

  const displayNews = news.length > 0 ? news : mockNews;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <Newspaper className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crypto News</h1>
      </div>

      {displayNews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
          <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No news available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for the latest cryptocurrency news.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayNews.map((item) => (
            <div
              key={item.id || item.url}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
                      {item.title || item.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(item.published_at)}</span>
                      </div>
                      {item.metadata?.source && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {item.metadata.source}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {item.url && item.url !== '#' && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <span className="text-sm font-medium">Read more</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note about API */}
      {news.length === 0 && (
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> To use the CryptoPanic API, you'll need to sign up for a free API key at{' '}
            <a
              href="https://cryptopanic.com/developers/api/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              cryptopanic.com
            </a>
            . Currently showing sample news data.
          </p>
        </div>
      )}
    </div>
  );
};

export default News;

