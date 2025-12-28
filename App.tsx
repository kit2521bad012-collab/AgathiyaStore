
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UserPanel } from './components/UserPanel';
import { AdminPanel } from './components/AdminPanel';
import { AuthPanel } from './components/AuthPanel';
import { dbService } from './services/dbService';
import { AuthUser } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentUser = dbService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoaded(true);
  }, []);

  const handleLogin = (authUser: AuthUser) => {
    setUser(authUser);
  };

  const handleLogout = () => {
    dbService.logout();
    setUser(null);
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center text-emerald-800 font-bold">Loading Store...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Custom Header to handle Logout */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-emerald-100 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-900 tracking-tight hidden sm:block">
              Agathiya<span className="text-emerald-500">Grocers</span>
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                <p className="text-sm font-bold text-emerald-800">{user.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 pt-12">
        {!user ? (
          <AuthPanel onLogin={handleLogin} />
        ) : user.role === 'admin' ? (
          <AdminPanel />
        ) : (
          <UserPanel />
        )}
      </main>

      <footer className="bg-emerald-950 text-emerald-50 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Agathiya Grocers</h3>
            <p className="text-emerald-400/60 text-sm leading-relaxed">
              Your neighborhood premium organic grocery store. Sourcing the freshest harvest directly from sustainable farms.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Store Hours</h4>
            <ul className="text-sm space-y-2 text-emerald-400/60">
              <li>Mon - Sat: 7:00 AM - 10:00 PM</li>
              <li>Sunday: 8:00 AM - 8:00 PM</li>
              <li className="pt-4 text-emerald-400">📍 Green Valley Road, Nature Park</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Admin Hub</h4>
            <p className="text-xs text-emerald-400/60 mb-4">
              Authorized access only for store inventory management and order fulfillment.
            </p>
            <div className="flex gap-2">
              <span className="bg-emerald-900/50 px-3 py-1 rounded-lg text-[10px] font-mono border border-emerald-800">SECURE TERMINAL ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-16 mt-16 border-t border-emerald-900 text-center text-xs text-emerald-700">
          © {new Date().getFullYear()} Agathiya Grocers. Premium Organic Retailer.
        </div>
      </footer>
    </div>
  );
};

export default App;
