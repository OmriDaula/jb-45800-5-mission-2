import { useState, useEffect } from 'react';
import type { CityRecord, LocalitiesResponse } from '../types';

const LOCALITIES_URL =
  'https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=32000';

interface CityOption {
  heName: string;
  queryName: string;
}

interface CitySelectProps {
  onCityChange: (city: string) => void;
}

export function CitySelect({ onCityChange }: CitySelectProps) {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(LOCALITIES_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: LocalitiesResponse = await res.json();

        const options: CityOption[] = data.result.records
          .map((r: CityRecord) => {
            const heName = (r.city_name_he ?? '').trim();
            const enName = (r.city_name_en ?? '').trim();
            return {
              heName,
              queryName: enName || heName,
            };
          })
          .filter((c) => c.heName && c.heName !== 'לא רשום')
          .sort((a, b) => a.heName.localeCompare(b.heName, 'he'));

        setCities(options);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cities');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  if (error) return <p className="error-msg">Error loading cities: {error}</p>;

  return (
    <select
      className="city-select"
      disabled={loading}
      defaultValue=""
      onChange={(e) => onCityChange(e.target.value)}
    >
      <option value="" disabled>
        {loading ? 'טוען יישובים...' : 'בחר יישוב'}
      </option>
      {cities.map((city, idx) => (
        <option key={`${city.queryName}-${idx}`} value={city.queryName}>
          {city.heName}
        </option>
      ))}
    </select>
  );
}
