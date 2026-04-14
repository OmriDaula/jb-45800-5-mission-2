# Architecture Document — Israel Weather App

## 1. Project Overview

A single-page application (SPA) that displays current weather data for Israeli localities.  
The user selects a locality from a dropdown, the app fetches real-time weather from an external API, and every search is saved to a persistent history log.

**Tech Stack:** React 19 · TypeScript 6 · Vite 8 · React Router 7

---

## 2. File Structure

```
Omri Daula Exam/
├── .env                          # Environment variables (API key)
├── index.html                    # Vite HTML entry point
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite bundler configuration
│
└── src/
    ├── main.tsx                  # React DOM mount point
    ├── App.tsx                   # Root component — Router + Context providers
    ├── App.css                   # Global app-level styles
    ├── index.css                 # CSS reset and base typography
    │
    ├── types/
    │   └── index.ts              # All TypeScript interfaces
    │
    ├── context/
    │   └── HistoryContext.tsx     # React Context + localStorage for search history
    │
    ├── components/
    │   ├── Navbar.tsx             # Shared navigation bar
    │   ├── Navbar.css
    │   ├── CitySelect.tsx         # Locality dropdown (fetches gov.il API)
    │   ├── WeatherCard.tsx        # Weather result display card
    │   ├── WeatherCard.css
    │   ├── HistoryTable.tsx       # Search history HTML table
    │   └── HistoryTable.css
    │
    └── pages/
        ├── Home.tsx               # Home page — search + weather display
        ├── Home.css
        ├── History.tsx            # History page — table of past searches
        ├── History.css
        ├── About.tsx              # About page — app info + developer details
        └── About.css
```

---

## 3. Application Boot Sequence

```
index.html
  └── <div id="root">
        └── main.tsx
              └── <StrictMode>
                    └── <App />
```

### Step-by-step:

1. **Vite** serves `index.html`, which includes a `<script>` tag pointing to `src/main.tsx`.
2. **main.tsx** imports global styles (`index.css`) and mounts the `<App />` component into the `#root` DOM node using `createRoot`.
3. **App.tsx** wraps the entire app in:
   - `<BrowserRouter>` — enables client-side routing.
   - `<HistoryProvider>` — provides search history state to all child components.
   - `<Navbar />` — rendered on every page (outside `<Routes>`).
   - `<Routes>` — maps URL paths to page components.

---

## 4. Routing Architecture

| Path        | Component    | Description                  |
|-------------|-------------|------------------------------|
| `/`         | `<Home />`   | Weather search page          |
| `/history`  | `<History />`| Search history table         |
| `/about`    | `<About />`  | App description + developer  |

**Implementation:** React Router v7 with `BrowserRouter`, `Routes`, `Route`.  
**Navigation:** `<NavLink>` components in `Navbar.tsx` with an `active` CSS class for the current route.

---

## 5. Data Flow — Weather Search (Home Page)

```
User selects city
       │
       ▼
CitySelect.onChange(cityEnglishName)
       │
       ▼
Home.handleCityChange(cityEn)
       │
       ├──► fetch( weatherapi.com/v1/current.json?key=...&q=cityEn )
       │
       ▼
   Response received
       │
       ├──► setWeather(data)         → WeatherCard renders
       │
       └──► addEntry({               → HistoryContext saves to state + localStorage
              datetime,
              city,
              country
            })
```

### Detailed steps:

1. **Page loads** → `CitySelect` mounts → `useEffect` fires → fetches all 1,300+ localities from the gov.il API.
2. **Dropdown populated** → Each `<option>` displays `city_name_he` (Hebrew), with `value` set to `city_name_en` (English). If the English name is empty in the data, the Hebrew name is used as fallback.
3. **User selects a city** → `onChange` fires immediately (no submit button) → calls `Home.handleCityChange(cityEn)`.
4. **Weather fetch** → `Home` sends a GET request to `https://api.weatherapi.com/v1/current.json?key=<KEY>&q=<CITY>`.
5. **On success** → State updates: `setWeather(data)` → `<WeatherCard>` renders the result. A new entry is added to history via `addEntry()`.
6. **On error** → Error message is displayed. Weather card is hidden.

---

## 6. State Management

### 6.1 Local Component State (useState)

| Component     | State Variable | Type                  | Purpose                      |
|---------------|---------------|-----------------------|------------------------------|
| `CitySelect`  | `cities`      | `CityOption[]`        | List of all loaded localities|
| `CitySelect`  | `loading`     | `boolean`             | Loading indicator            |
| `CitySelect`  | `error`       | `string`              | Error message                |
| `Home`        | `weather`     | `WeatherData \| null` | Current weather result       |
| `Home`        | `loading`     | `boolean`             | Weather fetch loading state  |
| `Home`        | `error`       | `string`              | Weather fetch error message  |

### 6.2 Global State (React Context)

**HistoryContext** provides:

| Property   | Type                              | Description                    |
|------------|-----------------------------------|--------------------------------|
| `history`  | `HistoryEntry[]`                  | Array of all past searches     |
| `addEntry` | `(entry: HistoryEntry) => void`   | Adds a new entry to the top    |

**Persistence:** On every `addEntry` call, the full array is serialized to `localStorage` under the key `"weatherHistory"`. On app startup, the initial state is restored from `localStorage`.

**Order:** Newest entries are prepended (`[entry, ...prev]`), so the history table always shows the most recent search first.

---

## 7. TypeScript Interfaces

All interfaces are defined in `src/types/index.ts`:

```typescript
// Represents a single record from the gov.il localities API
interface CityRecord {
  _id: number;
  city_code: number;
  city_name_he: string;    // Hebrew name (displayed in dropdown)
  city_name_en: string;    // English name (used as option value)
  region_code: number;
  region_name: string;
}

// Shape of the gov.il API response
interface LocalitiesResponse {
  result: {
    records: CityRecord[];
  };
}

// Shape of the weatherapi.com response (relevant fields only)
interface WeatherData {
  location: {
    name: string;          // City name
    country: string;       // Country name
    localtime: string;     // Local date/time
  };
  current: {
    temp_c: number;        // Temperature in Celsius
    wind_kph: number;      // Wind speed in km/h
    condition: {
      text: string;        // e.g. "Partly cloudy"
      icon: string;        // URL to weather icon
    };
  };
}

// A single search history entry
interface HistoryEntry {
  datetime: string;        // Formatted date + time of search
  city: string;            // City name from API response
  country: string;         // Country name from API response
}
```

---

## 8. External APIs

### 8.1 Israeli Localities (gov.il)

| Property | Value |
|----------|-------|
| **URL** | `https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=32000` |
| **Method** | GET |
| **Called by** | `CitySelect.tsx` on mount (`useEffect`) |
| **Response** | `{ result: { records: CityRecord[] } }` |
| **Records** | ~1,300 Israeli localities |

### 8.2 Current Weather (weatherapi.com)

| Property | Value |
|----------|-------|
| **URL** | `https://api.weatherapi.com/v1/current.json?key=<KEY>&q=<CITY>` |
| **Method** | GET |
| **Called by** | `Home.tsx` on select change |
| **API Key** | Stored in `.env` as `VITE_WEATHER_API_KEY`, accessed via `import.meta.env.VITE_WEATHER_API_KEY` |
| **Response** | `{ location: {...}, current: {...} }` |

---

## 9. Component Hierarchy

```
<App>
├── <BrowserRouter>
│   └── <HistoryProvider>              ← Context provider
│       └── <div className="app">
│           ├── <Navbar />             ← Always visible, shared across all pages
│           └── <Routes>
│               ├── / ──► <Home>
│               │         ├── <CitySelect />      ← Dropdown
│               │         └── <WeatherCard />      ← Weather result
│               │
│               ├── /history ──► <History>
│               │                └── <HistoryTable />  ← HTML table
│               │
│               └── /about ──► <About />           ← Static content
```

---

## 10. Component Responsibilities

| Component | File | Role |
|-----------|------|------|
| **App** | `App.tsx` | Root shell — sets up Router, Context, renders Navbar + Routes |
| **Navbar** | `components/Navbar.tsx` | Navigation links (Home, History, About) with active-link styling |
| **CitySelect** | `components/CitySelect.tsx` | Fetches localities on mount, renders `<select>`, emits selected city to parent |
| **WeatherCard** | `components/WeatherCard.tsx` | Presentational — receives `WeatherData` and renders country, city, temp, condition, wind, icon |
| **HistoryTable** | `components/HistoryTable.tsx` | Presentational — receives `HistoryEntry[]` and renders an HTML `<table>` |
| **Home** | `pages/Home.tsx` | Page controller — orchestrates CitySelect → weather fetch → WeatherCard, handles loading/error states |
| **History** | `pages/History.tsx` | Page — reads history from context, passes to HistoryTable |
| **About** | `pages/About.tsx` | Page — static content: app description + developer info |
| **HistoryProvider** | `context/HistoryContext.tsx` | Context provider — manages history array in state + localStorage |

---

## 11. Styling Architecture

- **Global resets** — `index.css`: box-sizing, margin reset, font stack, link decoration removal.
- **App-level** — `App.css`: full-height background color.
- **Per-component CSS** — Each visual component has its own `.css` file imported at the top of its `.tsx` file.
- **RTL support** — The city `<select>` has `direction: rtl` to display Hebrew text right-to-left.
- **Responsive design** — Navbar stacks vertically on screens below 600px. History table scrolls horizontally on small screens.
- **Color scheme** — Consistent slate/blue palette: `#1e3a5f` (dark navy), `#2563eb` (blue), `#f8fafc` (light gray background), `#0f172a` (text).

---

## 12. Error Handling

| Scenario | Handled In | Behavior |
|----------|------------|----------|
| Localities API fetch fails | `CitySelect.tsx` | Shows red error message, dropdown hidden |
| Localities API loading | `CitySelect.tsx` | Dropdown disabled, placeholder reads "טוען יישובים..." |
| Weather API fetch fails | `Home.tsx` | Shows red error message, previous weather card cleared |
| Weather API loading | `Home.tsx` | Shows blue "Loading weather data..." message |
| localStorage corrupted | `HistoryContext.tsx` | `try/catch` in initializer falls back to empty array |

---

## 13. localStorage Schema

| Key | Type | Description |
|-----|------|-------------|
| `weatherHistory` | `JSON string (HistoryEntry[])` | Serialized array of all past weather searches |

**Example stored value:**
```json
[
  { "datetime": "14/04/2026, 10:45:32", "city": "Jerusalem", "country": "Israel" },
  { "datetime": "14/04/2026, 10:44:18", "city": "Tel Aviv", "country": "Israel" }
]
```

---

## 14. Build & Run

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev

# Production build (TypeScript check + Vite bundle)
npm run build

# Preview production build
npm run preview
```

**Environment variable:** Create a `.env` file in the project root:
```
VITE_WEATHER_API_KEY=your_actual_api_key_here
```

---

## 15. Developer

**Name:** Omri Abu Daula  
**Institution:** John Bryce Training  
**Date:** April 2026
