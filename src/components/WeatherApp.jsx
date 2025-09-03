import React, { useState } from 'react';

/**
 * WeatherApp
 * - Geocodes city name using Open-Meteo geocoding API
 * - Fetches current weather using Open-Meteo forecast API (current_weather=true)
 * - Displays temperature, weather description, wind speed/direction, and time
 * - Handles errors (invalid city, API/network)
 */

/* Map Open-Meteo weathercodes to descriptions & emoji/icon */
const WEATHER_CODE_MAP = {
  0: { text: 'Clear sky', emoji: '☀️' },
  1: { text: 'Mainly clear', emoji: '🌤️' },
  2: { text: 'Partly cloudy', emoji: '⛅' },
  3: { text: 'Overcast', emoji: '☁️' },
  45: { text: 'Fog', emoji: '🌫️' },
  48: { text: 'Depositing rime fog', emoji: '🌫️' },
  51: { text: 'Light drizzle', emoji: '🌧️' },
  53: { text: 'Moderate drizzle', emoji: '🌧️' },
  55: { text: 'Dense drizzle', emoji: '🌧️' },
  56: { text: 'Freezing drizzle', emoji: '🧊🌧️' },
  57: { text: 'Dense freezing drizzle', emoji: '🧊🌧️' },
  61: { text: 'Slight rain', emoji: '🌧️' },
  63: { text: 'Moderate rain', emoji: '🌧️' },
  65: { text: 'Heavy rain', emoji: '⛈️' },
  66: { text: 'Freezing rain', emoji: '🧊🌧️' },
  67: { text: 'Heavy freezing rain', emoji: '🧊🌧️' },
  71: { text: 'Slight snow fall', emoji: '🌨️' },
  73: { text: 'Moderate snow fall', emoji: '🌨️' },
  75: { text: 'Heavy snow fall', emoji: '❄️' },
  77: { text: 'Snow grains', emoji: '🌨️' },
  80: { text: 'Slight rain showers', emoji: '🌦️' },
  81: { text: 'Moderate rain showers', emoji: '🌦️' },
  82: { text: 'Violent rain showers', emoji: '⛈️' },
  85: { text: 'Slight snow showers', emoji: '🌨️' },
  86: { text: 'Heavy snow showers', emoji: '❄️' },
  95: { text: 'Thunderstorm', emoji: '⛈️' },
  96: { text: 'Thunderstorm with slight hail', emoji: '⛈️' },
  99: { text: 'Thunderstorm with heavy hail', emoji: '⛈️' }
};

function weatherTextFromCode(code) {
  return WEATHER_CODE_MAP[code] ? WEATHER_CODE_MAP[code].text : 'Unknown';
}
function weatherEmojiFromCode(code) {
  return WEATHER_CODE_MAP[code] ? WEATHER_CODE_MAP[code].emoji : '🌈';
}

function degToCompass(num) {
  if (num === null || num === undefined) return '';
  const val = Math.floor((num / 22.5) + 0.5);
  const arr = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return arr[(val % 16)];
}

export default function WeatherApp() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);

  async function handleSearch(e) {
    e?.preventDefault();
    const q = city.trim();
    if (!q) {
      setError('Please enter a city name.');
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);
    setLocation(null);

    try {
      // 1) Geocoding: get lat/lon from Open-Meteo geocoding
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) throw new Error('Geocoding API error');
      const geoJson = await geoRes.json();

      if (!geoJson.results || geoJson.results.length === 0) {
        setError('No matching location found. Try a different city name.');
        setLoading(false);
        return;
      }

      // choose the top result (first)
      const place = geoJson.results[0];
      const lat = place.latitude;
      const lon = place.longitude;
      const placeName = `${place.name}${place.admin1 ? ', ' + place.admin1 : ''}${place.country ? ', ' + place.country : ''}`;

      setLocation({
        name: placeName,
        lat,
        lon,
        timezone: place.timezone
      });

      // 2) Weather: fetch current weather
      // Request current_weather and use auto timezone; set units to sensible ones
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto&windspeed_unit=kmh&temperature_unit=celsius`;
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error('Weather API error');
      const weatherJson = await weatherRes.json();

      if (!weatherJson.current_weather) {
        setError('Weather data unavailable for this location.');
        setLoading(false);
        return;
      }

      const cw = weatherJson.current_weather;
      setWeather({
        temperature: cw.temperature,
        windspeed: cw.windspeed,
        winddirection: cw.winddirection,
        weathercode: cw.weathercode,
        time: cw.time,
        raw: cw
      });
    } catch (err) {
      console.error(err);
      setError('Network or API error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-3 items-center">
        <label htmlFor="city" className="sr-only">City</label>
        <input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city (e.g., London, Tokyo, Mumbai)"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-weather-1 placeholder:text-slate-400"
          aria-label="City name"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-weather-1 to-weather-2 text-white font-medium shadow hover:opacity-95 transition"
          aria-label="Search"
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 loader" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          ) : null}
          Search
        </button>
      </form>

      {error ? (
        <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-md">
          {error}
        </div>
      ) : null}

      {/* Weather Card */}
      {weather && location ? (
        <div className="mt-2">
          <div className="flex items-start gap-4">
            <div className="text-6xl">{weatherEmojiFromCode(weather.weathercode)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{location.name}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {weatherTextFromCode(weather.weathercode)} • {new Date(weather.time).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-slate-800">
                    {Math.round(weather.temperature)}°C
                  </div>
                  <div className="text-sm text-slate-500">Feels like {Math.round(weather.temperature)}°C</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500">Wind</div>
                  <div className="text-sm font-medium text-slate-700">
                    {weather.windspeed} km/h • {degToCompass(weather.winddirection)} ({Math.round(weather.winddirection)}°)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500">Weather code</div>
                  <div className="text-sm font-medium text-slate-700">{weather.weathercode} — {weatherTextFromCode(weather.weathercode)}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500">Source</div>
                  <div className="text-sm font-medium text-slate-700">Open-Meteo</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-400">
                Note: Data provided by Open-Meteo (free weather API). No API key required.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-sm text-slate-500 bg-slate-50 border border-dashed rounded-md">
          Enter a city name and click <strong>Search</strong> to fetch the current weather.
        </div>
      )}

      {/* Optional: quick examples */}
      <div className="pt-2 text-xs text-slate-400">
        Example cities: London, New York, Mumbai, Tokyo, Sydney
      </div>
    </div>
  );
}
