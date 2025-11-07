// Local Storage utilities for favorites and portfolio

export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem('cryptoFavorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
};

export const saveFavorites = (favorites) => {
  try {
    localStorage.setItem('cryptoFavorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

export const toggleFavorite = (coinId) => {
  const favorites = getFavorites();
  const index = favorites.indexOf(coinId);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(coinId);
  }
  
  saveFavorites(favorites);
  return favorites;
};

export const isFavorite = (coinId) => {
  const favorites = getFavorites();
  return favorites.includes(coinId);
};

// Portfolio management
export const getPortfolio = () => {
  try {
    const portfolio = localStorage.getItem('cryptoPortfolio');
    return portfolio ? JSON.parse(portfolio) : [];
  } catch (error) {
    console.error('Error reading portfolio:', error);
    return [];
  }
};

export const savePortfolio = (portfolio) => {
  try {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
  } catch (error) {
    console.error('Error saving portfolio:', error);
  }
};

export const addToPortfolio = (coin) => {
  const portfolio = getPortfolio();
  const existingIndex = portfolio.findIndex(item => item.id === coin.id);
  
  if (existingIndex > -1) {
    portfolio[existingIndex] = { ...portfolio[existingIndex], ...coin };
  } else {
    portfolio.push(coin);
  }
  
  savePortfolio(portfolio);
  return portfolio;
};

export const removeFromPortfolio = (coinId) => {
  const portfolio = getPortfolio();
  const filtered = portfolio.filter(item => item.id !== coinId);
  savePortfolio(filtered);
  return filtered;
};

