export interface CityRecord {
  _id: number;
  city_code: number;
  city_name_he: string;
  city_name_en: string;
  region_code: number;
  region_name: string;
}

export interface LocalitiesResponse {
  result: {
    records: CityRecord[];
  };
}

export interface WeatherData {
  location: {
    name: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    wind_kph: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

export interface HistoryEntry {
  datetime: string;
  city: string;
  country: string;
}
