import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HistoryProvider } from './context/HistoryContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { About } from './pages/About';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <HistoryProvider>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </HistoryProvider>
    </BrowserRouter>
  );
}

export default App;
