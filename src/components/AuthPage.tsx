import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Phone,
  User,
  Hash,
  Award,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { AuthenticatedUser, loginStudent, registerStudent } from '../services/api';

interface AuthPageProps {
  initialTab?: 'login' | 'register';
  onAuthenticated: (user: AuthenticatedUser) => void;
  onNavigateToAdmin?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialTab = 'login',
  onAuthenticated,
  onNavigateToAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regHallTicket, setRegHallTicket] = useState('');
  const [regRank, setRegRank] = useState('');
  const [regCategory, setRegCategory] = useState('OC');
  const [regGender, setRegGender] = useState<'BOYS' | 'GIRLS'>('BOYS');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanMobile = loginMobile.replace(/\s+/g, '').replace(/[-+]/g, '').trim();

    if (!cleanMobile || !loginPassword) {
      setLoginError('❌ Please enter all required details.');
      return;
    }

    if (cleanMobile.length !== 10 || !/^\d{10}$/.test(cleanMobile)) {
      setLoginError('❌ Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoginLoading(true);
    try {
      const { user } = await loginStudent(cleanMobile, loginPassword);
      setLoginLoading(false);
      onAuthenticated(user);
    } catch (err: any) {
      setLoginLoading(false);
      const msg = err.message || 'Login failed.';
      // Format error message with icon if not already prefixed
      if (msg.startsWith('❌')) {
        setLoginError(msg);
      } else {
        setLoginError(`❌ ${msg}`);
      }
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMessage(null);

    // Front-end validations
    if (
      !regFullName.trim() ||
      !regHallTicket.trim() ||
      !regRank.trim() ||
      !regCategory ||
      !regGender ||
      !regMobile.trim() ||
      !regPassword ||
      !regConfirmPassword
    ) {
      setRegError('❌ Please enter all required details.');
      return;
    }

    const numericRank = parseInt(regRank.replace(/,/g, '').trim(), 10);
    if (isNaN(numericRank) || numericRank <= 0) {
      setRegError('❌ Rank must be a valid positive number.');
      return;
    }

    const cleanMobile = regMobile.replace(/\s+/g, '').replace(/[-+]/g, '').trim();
    if (cleanMobile.length !== 10 || !/^\d{10}$/.test(cleanMobile)) {
      setRegError('❌ Please enter a valid 10-digit mobile number.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('❌ Passwords do not match.');
      return;
    }

    setRegLoading(true);
    try {
      await registerStudent({
        fullName: regFullName.trim(),
        hallTicket: regHallTicket.trim().toUpperCase(),
        rank: numericRank,
        category: regCategory,
        gender: regGender,
        mobile: cleanMobile,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });

      setRegLoading(false);
      // Registration successful! Redirect to login tab as per Requirement 5 & 17
      setRegSuccessMessage(
        'Account created successfully! Please login with your registered mobile number and password.'
      );
      setLoginMobile(cleanMobile);
      setLoginPassword('');
      setLoginError(null);
      setActiveTab('login');
      window.history.replaceState(null, '', '/login');
    } catch (err: any) {
      setRegLoading(false);
      const msg = err.message || 'Registration failed.';
      if (msg.startsWith('❌')) {
        setRegError(msg);
      } else {
        setRegError(`❌ ${msg}`);
      }
    }
  };

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setLoginError(null);
    setRegError(null);
    if (tab === 'login') {
      window.history.replaceState(null, '', '/login');
    } else {
      window.history.replaceState(null, '', '/register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Header */}
      <div className="max-w-md w-full mx-auto text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-100 mb-1">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          EAMCET / TG EAPCET <span className="text-indigo-600">College Predictor</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Telangana Engineering Admission Cutoff & Web Options Portal
        </p>

        {/* Welcome Callout Banner */}
        <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 font-medium flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Secure Student Authentication Required to Access Predictor & Counselling Options</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-6 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/80 overflow-hidden">
        {/* Tab Switcher: [Login] and [Register] */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 p-1.5 gap-1.5">
          <button
            type="button"
            id="tab-btn-login"
            onClick={() => switchTab('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
          <button
            type="button"
            id="tab-btn-register"
            onClick={() => switchTab('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* ========================================================================= */}
          {/* LOGIN VIEW */}
          {/* ========================================================================= */}
          {activeTab === 'login' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Student Login</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your registered mobile number and password to access your predictions.
                </p>
              </div>

              {/* Registration Success Banner */}
              {regSuccessMessage && (
                <div
                  id="login-success-banner"
                  className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-900"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Success: </span>
                    {regSuccessMessage}
                  </div>
                </div>
              )}

              {/* Login Error Display */}
              {loginError && (
                <div
                  id="login-error-banner"
                  className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-800 font-semibold"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">{loginError}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="login-mobile-input"
                      type="tel"
                      maxLength={10}
                      value={loginMobile}
                      onChange={(e) => {
                        setLoginMobile(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="Enter registered mobile number"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium transition"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  id="btn-login-submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                >
                  {loginLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch to Register */}
              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600 space-y-1">
                <p>Don&apos;t have an account?</p>
                <button
                  type="button"
                  id="link-to-register"
                  onClick={() => switchTab('register')}
                  className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                >
                  Register
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* REGISTER VIEW */}
          {/* ========================================================================= */}
          {activeTab === 'register' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Create Student Account
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ALL fields are required for verified cutoff analysis.
                </p>
              </div>

              {/* Registration Error Display */}
              {regError && (
                <div
                  id="reg-error-banner"
                  className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-800 font-semibold"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">{regError}</div>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full Student Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Full Student Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-fullname-input"
                      type="text"
                      value={regFullName}
                      onChange={(e) => {
                        setRegFullName(e.target.value);
                        if (regError) setRegError(null);
                      }}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium transition"
                      required
                    />
                  </div>
                </div>

                {/* TG EAPCET Hall Ticket Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    TG EAPCET Hall Ticket Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-hallticket-input"
                      type="text"
                      value={regHallTicket}
                      onChange={(e) => {
                        setRegHallTicket(e.target.value.toUpperCase());
                        if (regError) setRegError(null);
                      }}
                      placeholder="Enter hall ticket number"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-mono uppercase font-semibold transition"
                      required
                    />
                  </div>
                </div>

                {/* EAMCET Rank */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    EAMCET Rank <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Award className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-rank-input"
                      type="text"
                      value={regRank}
                      onChange={(e) => {
                        setRegRank(e.target.value);
                        if (regError) setRegError(null);
                      }}
                      placeholder="Enter rank"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold transition"
                      required
                    />
                  </div>
                </div>

                {/* Category & Gender Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="reg-category-select"
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold transition cursor-pointer"
                      required
                    >
                      <option value="OC">OC (Open)</option>
                      <option value="EWS">EWS</option>
                      <option value="BC_A">BC-A</option>
                      <option value="BC_B">BC-B</option>
                      <option value="BC_C">BC-C</option>
                      <option value="BC_D">BC-D</option>
                      <option value="BC_E">BC-E</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="reg-gender-select"
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as 'BOYS' | 'GIRLS')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold transition cursor-pointer"
                      required
                    >
                      <option value="BOYS">Male / General (Boys)</option>
                      <option value="GIRLS">Female (Girls Quota)</option>
                    </select>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-mobile-input"
                      type="tel"
                      maxLength={10}
                      value={regMobile}
                      onChange={(e) => {
                        setRegMobile(e.target.value);
                        if (regError) setRegError(null);
                      }}
                      placeholder="Enter mobile number"
                      className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium transition"
                      required
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password-input"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          if (regError) setRegError(null);
                        }}
                        placeholder="Enter password"
                        className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-confirmpassword-input"
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => {
                          setRegConfirmPassword(e.target.value);
                          if (regError) setRegError(null);
                        }}
                        placeholder="Confirm password"
                        className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-medium transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  id="btn-register-submit"
                  disabled={regLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                >
                  {regLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch to Login */}
              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600 space-y-1">
                <p>Already have an account?</p>
                <button
                  type="button"
                  id="link-to-login"
                  onClick={() => switchTab('login')}
                  className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security & Verification Guarantee Footer Note */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-400 space-y-2">
        <p className="flex items-center justify-center gap-1.5 font-medium text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-time database validation & SCrypt password hashing enabled</span>
        </p>
        <p>Your admission web options and preferences are strictly isolated per student account.</p>

        {onNavigateToAdmin && (
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              id="link-to-admin-portal"
              onClick={onNavigateToAdmin}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Authorized Administrator Portal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
