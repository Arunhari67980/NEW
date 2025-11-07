import { useState } from 'react';
import { CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';
import { fetchCoins } from '../utils/api';

const ApiTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    const tests = [];

    // Test 1: Basic connectivity
    try {
      const pingResponse = await fetch('https://api.coingecko.com/api/v3/ping');
      const pingData = await pingResponse.json();
      tests.push({
        name: 'API Ping Test',
        success: pingResponse.ok,
        message: pingData.gecko_says || 'Connected',
      });
    } catch (error) {
      tests.push({
        name: 'API Ping Test',
        success: false,
        message: error.message,
      });
    }

    // Test 2: Direct fetch
    try {
      const fetchResponse = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=1'
      );
      const fetchData = await fetchResponse.json();
      tests.push({
        name: 'Direct Fetch Test',
        success: fetchResponse.ok && Array.isArray(fetchData),
        message: fetchResponse.ok
          ? `Got ${fetchData.length} coin(s)`
          : `HTTP ${fetchResponse.status}`,
      });
    } catch (error) {
      tests.push({
        name: 'Direct Fetch Test',
        success: false,
        message: error.message,
      });
    }

    // Test 3: App API function
    try {
      const appData = await fetchCoins(1, 1);
      tests.push({
        name: 'App API Function Test',
        success: Array.isArray(appData) && appData.length > 0,
        message: Array.isArray(appData)
          ? `Got ${appData.length} coin(s)`
          : 'Invalid response format',
      });
    } catch (error) {
      tests.push({
        name: 'App API Function Test',
        success: false,
        message: error.message,
      });
    }

    setResult({
      tests,
      allPassed: tests.every((t) => t.success),
      timestamp: new Date().toLocaleString(),
    });
    setTesting(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          API Connection Test
        </h1>

        <button
          onClick={runTest}
          disabled={testing}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
        >
          {testing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Testing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              <span>Run Tests</span>
            </>
          )}
        </button>

        {result && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg ${
                result.allPassed
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {result.allPassed ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {result.allPassed
                    ? 'All Tests Passed! ✅'
                    : 'Some Tests Failed ❌'}
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tested at: {result.timestamp}
              </p>
            </div>

            <div className="space-y-3">
              {result.tests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {test.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {test.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                      {test.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {!result.allPassed && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Troubleshooting Steps:
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <li>Check your internet connection</li>
                  <li>Wait 1-2 minutes if rate limited</li>
                  <li>Try refreshing the page</li>
                  <li>Check browser console (F12) for detailed errors</li>
                  <li>Try a different browser or network</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Quick Test in Browser Console:
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
            Open browser console (F12) and run:
          </p>
          <code className="block p-2 bg-white dark:bg-gray-800 rounded text-xs text-blue-900 dark:text-blue-100 overflow-x-auto">
            fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=1')
              .then(r =&gt; r.json())
              .then(data =&gt; console.log('✅ API works!', data))
              .catch(err =&gt; console.error('❌ Error:', err));
          </code>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;

