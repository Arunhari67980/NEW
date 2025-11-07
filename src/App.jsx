import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getTheme, setTheme } from './utils/theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CoinDetail from './pages/CoinDetail';
import Favorites from './pages/Favorites';
import Portfolio from './pages/Portfolio';
import News from './pages/News';
import ApiTest from './pages/ApiTest';

function App() {
  useEffect(() => {
    const theme = getTheme();
    setTheme(theme);
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/coin/:id" element={<CoinDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/news" element={<News />} />
          <Route path="/api-test" element={<ApiTest />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

