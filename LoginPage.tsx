
import React, { useState } from 'react';
import { UserRole, User } from './types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: isSignup ? name : (role === UserRole.COLLECTOR ? 'Sr. Collector' : 'Market Admin'),
      email,
      role,
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 relative overflow-hidden text-gray-900">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-green-200 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-30"></div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-white">
        <div className="bg-green-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <span className="text-3xl font-bold">U</span>
          </div>
          <h1 className="text-2xl font-bold">Uzhavar360</h1>
          <p className="text-green-100 text-sm mt-2 font-medium tracking-tight">Digital Agriculture Management</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignup ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignup ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'}`}
            >
              Signup
            </button>
          </div>

          <div className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 font-bold outline-none transition-all"
                  placeholder="e.g. Arul Selvan"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Gateway</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 font-bold outline-none transition-all"
                placeholder="admin@uzhavar360.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Secure Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 font-bold outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">System Privilege</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 font-bold outline-none cursor-pointer"
              >
                <option value={UserRole.ADMIN}>Market Staff (Administrator)</option>
                <option value={UserRole.COLLECTOR}>District Collector (Monitor)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg shadow-green-100 transition-all transform hover:-translate-y-0.5"
          >
            {isSignup ? 'CREATE SECURE ACCOUNT' : 'AUTHORIZE SESSION'}
          </button>

          <div className="pt-4 border-t border-gray-50 text-center">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
              Uzhavar360 Agri Core &copy; 2024 V1.0
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
