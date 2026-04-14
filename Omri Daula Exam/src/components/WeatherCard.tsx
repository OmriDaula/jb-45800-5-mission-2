import type { WeatherData } from '../types';
import './WeatherCard.css';

interface WeatherCardProps {
  data: WeatherData;
}

export function WeatherCard({ data }: WeatherCardProps) {
  const { location, current } = data;

  return (
    <div className="weather-card">
      <div className="weather-header">
        <img
          src={current.condition.icon}
          alt={current.condition.text}
          className="weather-icon"
        />
        <div>
          <div className="weather-temp">{current.temp_c}°C</div>
          <h2 className="weather-city">{location.name}</h2>
          <p className="weather-country">{location.country}</p>
        </div>
      </div>

      <div className="weather-details">
        <div className="weather-detail">
          <span className="detail-label">Condition</span>
          <span className="detail-value">{current.condition.text}</span>
        </div>
        <div className="weather-detail">
          <span className="detail-label">Wind</span>
          <span className="detail-value">{current.wind_kph} kph</span>
        </div>
      </div>
    </div>
  );
}
