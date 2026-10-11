/**
 * AuthScreen: Login and Registration
 * Supports real Firebase Auth with Email/Password + Sinhala Demo Personas
 */
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, theme } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ANIME_AVATARS } from '../../utils/avatars';

interface AuthScreenProps {
  initialRole?: UserRole;
  onBack: () => void;
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialRole = 'tutee',
  onBack,
  onSuccess,
}) => {
  const { login, register, setRole: setContextRole } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const roleColor = theme.colors[role];

  // Quick preset Sinhala personas for evaluators to test roles instantly
  const handleQuickDemo = async (demoRole: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      setRole(demoRole);
      setContextRole(demoRole);
      if (demoRole === 'tutor') {
        setEmail('kavindu.p@mrt.ac.lk');
        setPassword('demo123456');
        await login('kavindu.p@mrt.ac.lk', 'demo123456', 'tutor');
      } else if (demoRole === 'parent') {
        setEmail('malani.j@family.lk');
        setPassword('demo123456');
        await login('malani.j@family.lk', 'demo123456', 'parent');
      } else {
        setEmail('senuri.dias@school.lk');
        setPassword('demo123456');
        await login('senuri.dias@school.lk', 'demo123456', 'tutee');
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isLogin && !name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password, role);
      } else {
        await register(email, password, name, role);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-6 pt-5 pb-6 bg-white overflow-y-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-slate-400">
          {isLogin ? 'Sign In' : 'Create Account'}
        </span>
        <div className="w-10" />
      </div>

      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isLogin ? 'Welcome back to TutorLink' : 'Join the TutorLink community'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isLogin
            ? 'Sign in to access your sessions, schedules, and reviews.'
            : 'Get started by creating your peer learning account.'}
        </p>
      </div>

      {/* Role Selector Chips */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Your Account Role
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['tutee', 'tutor', 'parent'] as UserRole[]).map((r) => {
            const isSelected = role === r;
            return (
              <button
                type="button"
                key={r}
                onClick={() => {
                  setRole(r);
                  setContextRole(r);
                }}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition flex flex-col items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'
                }`}
                style={{
                  backgroundColor: isSelected ? theme.colors[r] : undefined,
                }}
              >
                <span>{r === 'tutee' ? 'Student' : r === 'tutor' ? 'Tutor' : 'Parent'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Demo Logins for Evaluator with Sinhala Personas */}
      <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Evaluator Personas:</span>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('tutee')}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100 text-indigo-900 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <img src={ANIME_AVATARS.senuri} alt="Senuri" className="w-7 h-7 rounded-full bg-white border border-indigo-200" />
              <div>
                <p className="text-xs font-bold leading-tight">Student: Senuri Dias</p>
                <p className="text-[10px] text-indigo-600">A/L Student • Combined Maths</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md shadow-2xs">Select</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('tutor')}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-100 text-teal-900 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <img src={ANIME_AVATARS.kavindu} alt="Kavindu" className="w-7 h-7 rounded-full bg-white border border-teal-200" />
              <div>
                <p className="text-xs font-bold leading-tight">Tutor: Kavindu Perera</p>
                <p className="text-[10px] text-teal-700">Moratuwa Eng • Verified Mentor</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded-md shadow-2xs">Select</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('parent')}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-100 text-rose-900 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <img src={ANIME_AVATARS.malani} alt="Malani" className="w-7 h-7 rounded-full bg-white border border-rose-200" />
              <div>
                <p className="text-xs font-bold leading-tight">Parent: Malani Jayawardena</p>
                <p className="text-[10px] text-rose-600">Senuri’s Parent • Learning Monitor</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-md shadow-2xs">Select</span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Senuri Dias"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                const lower = val.toLowerCase();
                if (lower.includes('kavindu') || lower.includes('mrt.ac.lk')) {
                  setRole('tutor');
                  setContextRole('tutor');
                } else if (lower.includes('malani') || lower.includes('family.lk')) {
                  setRole('parent');
                  setContextRole('parent');
                }
              }}
              placeholder={
                role === 'tutor'
                  ? 'e.g. kavindu.p@mrt.ac.lk'
                  : role === 'parent'
                  ? 'e.g. malani.j@family.lk'
                  : 'e.g. senuri.dias@school.lk'
              }
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="pt-2">
          <PrimaryButton role={role} loading={loading} type="submit">
            {isLogin ? 'Sign In' : 'Create Account'}
          </PrimaryButton>
        </div>
      </form>

      {/* Switch between Sign In / Sign Up */}
      <div className="mt-auto pt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          {isLogin ? "Don't have an account? " : 'Already registered? '}
          <span className="font-bold underline" style={{ color: roleColor }}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </button>
      </div>
    </div>
  );
};
