import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { formatPrice } from '../utils/format';

const PRICE_ALERTS_KEY = 'cryptoPriceAlerts';

const getAlerts = () => {
  try {
    return JSON.parse(localStorage.getItem(PRICE_ALERTS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveAlerts = (alerts) => {
  localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
};

const PriceAlert = ({ coinId, coinName, currentPrice }) => {
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState('above');

  useEffect(() => {
    const coinAlerts = getAlerts().filter(a => a.coinId === coinId);
    setAlerts(coinAlerts);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [coinId]);

  const addAlert = () => {
    if (!alertPrice || parseFloat(alertPrice) <= 0) return;

    const newAlert = {
      id: Date.now(),
      coinId,
      coinName,
      price: parseFloat(alertPrice),
      type: alertType,
      currentPrice,
    };

    const allAlerts = getAlerts();
    allAlerts.push(newAlert);
    saveAlerts(allAlerts);
    setAlerts([...alerts, newAlert]);
    setAlertPrice('');
    setShowForm(false);
  };

  const removeAlert = (alertId) => {
    const allAlerts = getAlerts().filter(a => a.id !== alertId);
    saveAlerts(allAlerts);
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  // Check if price alerts should trigger
  useEffect(() => {
    if (!currentPrice || alerts.length === 0) return;

    alerts.forEach(alert => {
      const shouldTrigger = alert.type === 'above' 
        ? currentPrice >= alert.price 
        : currentPrice <= alert.price;

      if (shouldTrigger) {
        // Browser notification (requires permission)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Price Alert: ${coinName}`, {
            body: `Price is ${alert.type === 'above' ? 'above' : 'below'} ${formatPrice(alert.price)}`,
            icon: '/vite.svg',
          });
        }
      }
    });
  }, [currentPrice, alerts, coinName]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Price Alerts</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          {showForm ? 'Cancel' : 'Add Alert'}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex gap-2 mb-2">
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <input
              type="number"
              value={alertPrice}
              onChange={(e) => setAlertPrice(e.target.value)}
              placeholder="Price"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            <button
              onClick={addAlert}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No alerts set</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {alert.type === 'above' ? 'Above' : 'Below'} {formatPrice(alert.price)}
                </p>
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceAlert;

