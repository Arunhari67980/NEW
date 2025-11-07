import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const CRYPTOPANIC_API = 'https://cryptopanic.com/api/v1';

// CORS Proxy options (use if direct API fails)
const CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/', // May require activation
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 15000, // 15 second timeout (increased)
  headers: {
    'Accept': 'application/json',
  },
});

// Alternative: Use native fetch with better error handling
const fetchWithFallback = async (url, options = {}) => {
  try {
    // Try direct fetch first
    const response = await fetch(url, {
      ...options,
      headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // If CORS error, try with proxy
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      console.warn('CORS error detected, trying alternative method...');
      // Try with axios as fallback
      try {
        const axiosResponse = await apiClient.get(url, { params: options.params });
        return axiosResponse.data;
      } catch (axiosError) {
        throw new Error(`Network error: ${error.message}`);
      }
    }
    throw error;
  }
};

// Retry logic for failed requests
const retryRequest = async (requestFn, retries = 2, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// CoinGecko API calls with multiple fallback methods
export const fetchCoins = async (page = 1, perPage = 100) => {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: 'false',
    price_change_percentage: '1h,24h,7d',
  });

  const url = `${COINGECKO_API}/coins/markets?${params.toString()}`;

  // Method 1: Try axios first
  try {
    console.log('🔄 Method 1: Trying axios...');
    const response = await retryRequest(() =>
      apiClient.get(`${COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: perPage,
          page: page,
          sparkline: false,
          price_change_percentage: '1h,24h,7d',
        },
      })
    );
    console.log('✅ Success with axios');
    return response.data;
  } catch (axiosError) {
    console.warn('⚠️ Axios failed, trying fetch...', axiosError.message);
    
    // Method 2: Try native fetch
    try {
      console.log('🔄 Method 2: Trying native fetch...');
      const data = await fetchWithFallback(url);
      console.log('✅ Success with fetch');
      return data;
    } catch (fetchError) {
      console.warn('⚠️ Fetch failed, trying direct fetch...', fetchError.message);
      
      // Method 3: Try direct fetch with no-cors mode (limited)
      try {
        console.log('🔄 Method 3: Trying direct fetch...');
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Success with direct fetch');
        return data;
      } catch (directError) {
        console.error('❌ All methods failed');
        
        // Provide detailed error message
        const errorDetails = {
          axios: axiosError?.message || 'Unknown',
          fetch: fetchError?.message || 'Unknown',
          direct: directError?.message || 'Unknown',
        };

        console.error('Error details:', errorDetails);

        // Provide user-friendly error message
        if (axiosError?.response) {
          const status = axiosError.response.status;
          if (status === 429) {
            throw new Error('Rate limit exceeded. Please wait 1-2 minutes and try again.');
          } else if (status === 404) {
            throw new Error('API endpoint not found. The API may have changed.');
          } else {
            throw new Error(`API error (${status}): ${axiosError.response.statusText}`);
          }
        } else if (axiosError?.request || directError?.message?.includes('Failed to fetch')) {
          throw new Error('Network error: Check your internet connection or try again in a moment. If the problem persists, the API may be temporarily unavailable.');
        } else {
          throw new Error(`Failed to load data: ${directError.message || 'Unknown error'}`);
        }
      }
    }
  }
};

export const fetchCoinDetails = async (coinId) => {
  try {
    const response = await retryRequest(() =>
      apiClient.get(`${COINGECKO_API}/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false,
        },
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching coin details:', error);
    if (error.response?.status === 404) {
      throw new Error(`Coin "${coinId}" not found.`);
    }
    throw error;
  }
};

export const fetchCoinHistory = async (coinId, days = 7) => {
  try {
    const response = await retryRequest(() =>
      apiClient.get(`${COINGECKO_API}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: days <= 1 ? 'hourly' : 'daily',
        },
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching coin history:', error);
    throw error;
  }
};

export const fetchTrendingCoins = async () => {
  try {
    const response = await retryRequest(() =>
      apiClient.get(`${COINGECKO_API}/search/trending`)
    );
    return response.data.coins || [];
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    // Return empty array instead of throwing for trending coins
    return [];
  }
};

export const fetchGlobalStats = async () => {
  try {
    const response = await retryRequest(() =>
      apiClient.get(`${COINGECKO_API}/global`)
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching global stats:', error);
    // Return null instead of throwing for global stats
    return null;
  }
};

// CryptoPanic API calls
export const fetchCryptoNews = async (page = 1) => {
  try {
    // Note: CryptoPanic requires an API key for production
    // For demo purposes, we'll use a public endpoint if available
    // You may need to sign up at cryptopanic.com for an API key
    const response = await axios.get(`${CRYPTOPANIC_API}/posts/`, {
      params: {
        auth_token: 'demo', // Replace with your API key
        public: true,
        page: page,
      },
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    // Return mock data if API fails
    return [];
  }
};

