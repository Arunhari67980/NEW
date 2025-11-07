// Utility to test API connectivity
export const testCoinGeckoAPI = async () => {
  const results = {
    success: false,
    message: '',
    data: null,
    error: null,
  };

  try {
    // Test 1: Simple fetch
    console.log('Testing CoinGecko API...');
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=1',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      results.message = `HTTP ${response.status}: ${response.statusText}`;
      results.error = {
        status: response.status,
        statusText: response.statusText,
      };
      return results;
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      results.success = true;
      results.message = 'API is working correctly!';
      results.data = data;
    } else {
      results.message = 'API returned unexpected data format';
      results.error = { data };
    }
  } catch (error) {
    results.message = error.message;
    results.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    // Check for specific error types
    if (error.message.includes('Failed to fetch')) {
      results.message = 'Network error: Check your internet connection or CORS settings';
    } else if (error.message.includes('timeout')) {
      results.message = 'Request timeout: API may be slow or unavailable';
    }
  }

  return results;
};

// Test and log results
export const runApiTest = async () => {
  console.group('🔍 CoinGecko API Test');
  const result = await testCoinGeckoAPI();
  
  if (result.success) {
    console.log('✅', result.message);
    console.log('📊 Sample data:', result.data[0]);
  } else {
    console.error('❌', result.message);
    console.error('🔍 Error details:', result.error);
  }
  
  console.groupEnd();
  return result;
};

