
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  users: User[];
  onSignup: (name: string, password?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users, onSignup }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loginMode, setLoginMode] = useState<'staff' | 'admin'>('staff');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLoginView) {
      const user = users.find(u => u.username === fullName.trim() || u.fullName.toLowerCase() === fullName.trim().toLowerCase());
      
      if (!user) {
        setError('Account not found. Please register first.');
        return;
      }

      // Role Check for Manager Portal
      if (loginMode === 'admin' && user.role !== UserRole.MANAGER) {
        setError('Access Denied: This portal is for Managers only.');
        return;
      }

      // Password Check
      if (user.password && user.password !== password) {
        setError('Invalid password. Please try again.');
        return;
      }

      onLogin(user);
    } else {
      const exists = users.find(u => u.fullName.toLowerCase() === fullName.trim().toLowerCase());
      if (exists) {
        setError('An account with this name already exists.');
      } else {
        if (password.length < 4) {
          setError('Password must be at least 4 characters long.');
          return;
        }
        onSignup(fullName, password);
        setSuccess('Registration successful! Please wait for a manager to approve your account.');
        setFullName('');
        setPassword('');
        setIsLoginView(true);
      }
    }
  };

  const isManager = loginMode === 'admin' && isLoginView;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full transition-colors duration-700 blur-3xl ${isManager ? 'bg-amber-100/30' : 'bg-indigo-100/50'}`} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl" />

      <div className="w-full max-md relative z-10 animate-pop">
        <div className="text-center mb-8">
          <div className={`inline-flex w-16 h-16 rounded-2xl items-center justify-center text-white shadow-2xl transition-all duration-500 mb-6 rotate-3 ${isManager ? 'bg-slate-900 shadow-slate-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Bug Tracking System</h1>
          {!isManager && <p className="text-slate-500 font-medium">Enterprise Quality Assurance</p>}
        </div>

        {isLoginView && (
          <div className="flex p-1 bg-slate-200/50 rounded-2xl mb-6 backdrop-blur">
            <button 
              onClick={() => { setLoginMode('admin'); setError(''); }}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMode === 'admin' ? 'bg-slate-900 text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Manager Portal
            </button>
            <button 
              onClick={() => { setLoginMode('staff'); setError(''); }}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMode === 'staff' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Staff Portal
            </button>
          </div>
        )}

        <div className={`bg-white rounded-[2.5rem] p-10 border transition-all duration-500 shadow-2xl ${isManager ? 'border-amber-100 shadow-amber-100/20' : 'border-slate-200 shadow-slate-200/50'}`}>
          <div className="mb-8">
            <h2 className={`text-xl font-black ${isManager ? 'text-slate-900' : 'text-slate-900'}`}>
              {isLoginView ? (isManager ? 'Secure Login' : 'Sign In') : 'Join the Team'}
            </h2>
            {!isManager && (
               <p className="text-xs font-medium text-slate-400 mt-1">
                {isLoginView 
                  ? 'Enter your staff credentials to continue.' 
                  : 'Register your account for manager review.'}
              </p>
            )}
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {isManager ? 'Username' : 'Employee Name / Username'}
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isManager ? "e.g. admin" : "e.g. Alice Johnson"}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {isManager ? 'Password' : 'Secure Password'}
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-bold animate-shake">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-[11px] font-bold">
                {success}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:translate-y-0 ${isManager ? 'bg-slate-900 text-white shadow-slate-200 hover:bg-black' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'}`}
            >
              {isLoginView ? (isManager ? 'Secure Login' : 'Staff Access') : 'Register for Review'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
             <button 
                onClick={() => { setIsLoginView(!isLoginView); setError(''); setSuccess(''); setLoginMode('staff'); }}
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-colors"
              >
                {isLoginView ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
