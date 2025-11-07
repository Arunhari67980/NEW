import { useEffect, useState, useRef } from 'react';
import { cryptoWebSocket } from '../utils/websocket';

/**
 * Custom hook for real-time cryptocurrency price updates
 * @param {string} coinId - CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
 * @param {number} initialPrice - Initial price from REST API
 * @param {boolean} enabled - Whether to enable real-time updates
 * @returns {Object} - { price, priceChange, isConnected, error }
 */
export const useRealtimePrice = (coinId, initialPrice = null, enabled = true) => {
  const [price, setPrice] = useState(initialPrice);
  const [priceChange, setPriceChange] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const callbackRef = useRef(null);

  useEffect(() => {
    if (!enabled || !coinId) {
      return;
    }

    // Update initial price when it changes
    if (initialPrice !== null) {
      setPrice(initialPrice);
    }

    // Create callback for WebSocket updates
    callbackRef.current = (data) => {
      if (data.id === coinId) {
        setPrice(data.current_price);
        setPriceChange(data.price_change_percentage_24h);
        setError(null);
      }
    };

    // Subscribe to updates
    cryptoWebSocket.subscribe(coinId, callbackRef.current);

    // Check connection status
    const checkConnection = () => {
      setIsConnected(cryptoWebSocket.isConnected());
    };

    checkConnection();
    const connectionInterval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(connectionInterval);
      if (callbackRef.current) {
        cryptoWebSocket.unsubscribe(coinId);
      }
    };
  }, [coinId, enabled, initialPrice]);

  return { price, priceChange, isConnected, error };
};

/**
 * Hook for multiple coins real-time updates
 * @param {Array<string>} coinIds - Array of CoinGecko coin IDs
 * @param {Object} initialPrices - Object with coinId as key and price as value
 * @param {boolean} enabled - Whether to enable real-time updates
 * @returns {Object} - { prices, isConnected, error }
 */
export const useRealtimePrices = (coinIds = [], initialPrices = {}, enabled = true) => {
  const [prices, setPrices] = useState(initialPrices);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const callbacksRef = useRef(new Map());

  useEffect(() => {
    if (!enabled || coinIds.length === 0) {
      return;
    }

    // Update initial prices
    setPrices(initialPrices);

    // Subscribe to all coins
    coinIds.forEach((coinId) => {
      const callback = (data) => {
        if (data.id === coinId) {
          setPrices((prev) => ({
            ...prev,
            [coinId]: {
              price: data.current_price,
              priceChange: data.price_change_percentage_24h,
              lastUpdated: data.last_updated,
            },
          }));
          setError(null);
        }
      };

      callbacksRef.current.set(coinId, callback);
      cryptoWebSocket.subscribe(coinId, callback);
    });

    // Check connection status
    const checkConnection = () => {
      setIsConnected(cryptoWebSocket.isConnected());
    };

    checkConnection();
    const connectionInterval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(connectionInterval);
      callbacksRef.current.forEach((callback, coinId) => {
        cryptoWebSocket.unsubscribe(coinId);
      });
      callbacksRef.current.clear();
    };
  }, [coinIds.join(','), enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { prices, isConnected, error };
};

