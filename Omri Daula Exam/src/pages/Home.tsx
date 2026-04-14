import { useState } from 'react';
import { CitySelect } from '../components/CitySelect';
import { WeatherCard } from '../components/WeatherCard';
import { useHistory } from '../context/HistoryContext';
import type { WeatherData } from '../types';
import './Home.css';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addEntry } = useHistory();

  const handleCityChange = async (cityEn: string) => {
    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(cityEn)}`
      );
      if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
      const data: WeatherData = await res.json();
      setWeather(data);

      addEntry({
        datetime: new Date().toLocaleString('en-GB'),
        city: data.location.name,
        country: data.location.country,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <h1 className="page-title">Weather Search</h1>
      <p className="page-subtitle">
        Select an Israeli locality to see current weather
      </p>

      <CitySelect onCityChange={handleCityChange} />

      {loading && <p className="loading-msg">Loading weather data...</p>}
      {error && <p className="error-msg">{error}</p>}
      {weather && <WeatherCard data={weather} />}
    </div>
  );
}
