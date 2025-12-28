
import React, { useState } from 'react';
import { dbService } from '../services/dbService';
import { AuthUser } from '../types';

interface AuthPanelProps {
  onLogin: (user: AuthUser) => void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', address: '',
    phone: '', secondaryPhone: '', gender: '' as 'Male' | 'Female' | 'Other' | ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!formData.email || !formData.password) {
      return "Email and Password are required.";
    }

    if (isRegistering) {
      if (!formData.name) return "Full name is required.";
      if (!formData.address) return "Address is required.";
      if (!formData.phone) return "Phone number is required.";
      if (!/^[0-9]{10}$/.test(formData.phone)) return "Primary phone must be exactly 10 digits.";
      if (formData.secondaryPhone && !/^[0-9]{10}$/.test(formData.secondaryPhone)) return "Secondary phone must be 10 digits if provided.";
      if (!formData.gender) return "Gender is required.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      if (isRegistering) {
        const success = await dbService.register({
          name: formData.name,
          email: formData.email,
          address: formData.address,
          phone: formData.phone,
          secondaryPhone: formData.secondaryPhone,
          gender: formData.gender as any,
          role: 'user'
        }, formData.password);
        
        if (success) {
          setIsRegistering(false);
          setFormData({ name: '', email: '', password: '', address: '', phone: '', secondaryPhone: '', gender: '' });
          setError('Account created! Please login now.');
        } else {
          setError('Email already exists. Try a different one.');
        }
      } else {
        const user = await dbService.login(formData.email, formData.password);
        if (user) onLogin(user);
        else setError('Invalid email or password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-xl border border-emerald-50 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-emerald-950">{isRegistering ? 'Join Us' : 'Welcome Back'}</h2>
          <p className="text-slate-500 mt-2">{isRegistering ? 'Create your grocery account' : 'Sign in to Agathiya Store'}</p>
        </div>

        {error && (
          <div className={`p-4 rounded-xl text-sm mb-6 font-medium border text-center ${error.includes('created') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Full Name *</label>
                <input type="text" placeholder="e.g. Rahul Sharma" className="auth-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Complete Address *</label>
                <textarea placeholder="House No, Street, Area..." className="auth-input h-20" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Phone *</label>
                  <input type="tel" maxLength={10} placeholder="10 Digits" className="auth-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Alt Phone</label>
                  <input type="tel" maxLength={10} placeholder="Optional" className="auth-input" value={formData.secondaryPhone} onChange={e => setFormData({...formData, secondaryPhone: e.target.value.replace(/\D/g, '')})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Gender *</label>
                <select className="auth-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Email Address *</label>
            <input type="email" placeholder="email@domain.com" className="auth-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Password *</label>
            <input type="password" placeholder="••••••••" className="auth-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          
          <button disabled={isLoading} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all transform active:scale-95 disabled:opacity-70 mt-4">
            {isLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          {isRegistering ? 'Already have an account?' : "New here?"}{' '}
          <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-emerald-600 font-bold hover:underline">
            {isRegistering ? 'Login Now' : 'Register Here'}
          </button>
        </p>
      </div>
      <style>{`
        .auth-input { @apply w-full px-4 py-3 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 placeholder:text-slate-300; }
      `}</style>
    </div>
  );
};
