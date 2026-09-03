import React, { useState } from 'react';
import { X, UserCheck, LogIn, UserPlus, Lock, Award, Mail, GraduationCap } from 'lucide-react';
import { Category, Gender } from '../types';
import { CATEGORIES_LIST } from '../data/colleges';

export interface StudentProfile {
  name: string;
  hallTicket: string;
  email: string;
  rank: number;
  category: Category;
  gender: Gender;
  isLoggedIn: boolean;
}

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile | null;
  onLogin: (profile: StudentProfile) => void;
  onLogout: () => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [hallTicket, setHallTicket] = useState('');
  const [email, setEmail] = useState('');
  const [rank, setRank] = useState('124972');
  const [category, setCategory] = useState<Category>('OC');
  const [gender, setGender] = useState<Gender>('BOYS');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rankNum = parseInt(rank.replace(/,/g, '').trim(), 10) || 124972;
    const profile: StudentProfile = {
      name: name.trim() || (isRegisterMode ? 'EAPCET Student' : 'Verified Candidate'),
      hallTicket: hallTicket.trim().toUpperCase() || '25EAPCET99104',
      email: email.trim() || 'student@eapcet.org',
      rank: rankNum,
      category,
      gender,
      isLoggedIn: true,
    };
    onLogin(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {currentUser?.isLoggedIn
                  ? 'Student Profile & Account'
                  : isRegisterMode
                  ? 'Create Student Account'
                  : 'Student Account Login'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {currentUser?.isLoggedIn
                  ? 'Your saved preferences & details'
                  : 'Sync your counselling list across sessions'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentUser?.isLoggedIn ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-indigo-600 font-bold">Candidate Name:</span>
                  <span className="font-black text-slate-900">{currentUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600 font-bold">Hall Ticket No:</span>
                  <span className="font-mono font-bold text-slate-900">{currentUser.hallTicket}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600 font-bold">EAMCET Rank:</span>
                  <span className="font-mono font-black text-indigo-900">
                    {currentUser.rank.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600 font-bold">Category & Gender:</span>
                  <span className="font-semibold text-slate-800">
                    {currentUser.category} ({currentUser.gender === 'BOYS' ? 'Male' : 'Female'})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {isRegisterMode && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  TG EAPCET Hall Ticket / Roll Number
                </label>
                <input
                  type="text"
                  required
                  value={hallTicket}
                  onChange={(e) => setHallTicket(e.target.value)}
                  placeholder="e.g. 2425E01823"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    EAMCET Rank
                  </label>
                  <input
                    type="text"
                    required
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    placeholder="e.g. 1,24,972"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {CATEGORIES_LIST.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Gender Quota
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('BOYS')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      gender === 'BOYS'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Male (Boys)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('GIRLS')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      gender === 'GIRLS'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Female (Girls)
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  {isRegisterMode ? 'Register & Save Profile' : 'Log In & Sync Counselling List'}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  {isRegisterMode
                    ? 'Already have an account? Log In'
                    : "New candidate? Create Account"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
