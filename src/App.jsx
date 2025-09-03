import React from 'react';
import WeatherApp from './components/WeatherApp';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-800">Weather Now</h1>
          <p className="text-sm text-slate-500 mt-1">Type a city and get current weather (Open-Meteo)</p>
        </header>

        <main>
          <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6">
            <WeatherApp />
          </div>
        </main>

        <footer className="text-center text-xs text-slate-400 mt-6">
          <span>Data from Open-Meteo • Built with React + Tailwind</span>
        </footer>
      </div>
    </div>
  );
}
