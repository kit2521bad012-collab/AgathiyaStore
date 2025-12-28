
import React from 'react';

interface HeaderProps {
  currentView: 'user' | 'admin';
  setView: (view: 'user' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-emerald-100 px-4 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-emerald-900 tracking-tight">
            Agathiya<span className="text-emerald-500">Store</span>
          </h1>
        </div>

        <nav className="flex items-center bg-emerald-50 p-1 rounded-full border border-emerald-100">
          <button
            onClick={() => setView('user')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              currentView === 'user' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => setView('admin')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              currentView === 'admin' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Admin
          </button>
        </nav>
      </div>
    </header>
  );
};
