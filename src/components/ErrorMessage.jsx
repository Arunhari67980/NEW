import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message = 'Something went wrong. Please try again later.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Error
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={18} />
          <span>Retry</span>
        </button>
      )}
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
        <p className="mb-2">Common solutions:</p>
        <ul className="list-disc list-inside space-y-1 text-left">
          <li>Check your internet connection</li>
          <li>Wait a moment if rate limited</li>
          <li>Refresh the page</li>
          <li>Check browser console for details</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorMessage;

