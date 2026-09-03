import React from 'react';
import { BookmarkCheck, Sparkles, LogOut, User, ShieldCheck } from 'lucide-react';
import { AuthenticatedUser } from '../services/api';

interface NavbarProps {
  activeTab: 'home' | 'predictor' | 'counselling';
  setActiveTab: (tab: 'home' | 'predictor' | 'counselling') => void;
  counsellingCount: number;
  currentUser: AuthenticatedUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  counsellingCount,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('predictor')}
            id="nav-logo"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-sm shadow-indigo-200">
              E
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                <span>EAPCET</span>
                <span className="text-indigo-600 font-medium">Predictor 2025</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Telangana Engineering College & Cutoff Analysis
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium text-slate-600">
            <button
              id="nav-tab-predictor"
              onClick={() => setActiveTab('predictor')}
              className={`pb-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'predictor'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                  : 'hover:text-indigo-600'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>College Predictor</span>
            </button>

            <button
              id="nav-tab-counselling"
              onClick={() => setActiveTab('counselling')}
              className={`relative pb-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'counselling'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                  : 'hover:text-indigo-600'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 text-indigo-600" />
              <span>My Counselling List</span>
              {counsellingCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-white bg-indigo-600 rounded-full">
                  {counsellingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Items: Student Profile details + Logout Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <div
                id="student-profile-chip"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
                title={`Hall Ticket: ${currentUser.hallTicket} | Rank: ${currentUser.rank.toLocaleString()} | Category: ${currentUser.category}`}
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight">
                  <div className="font-bold text-slate-900 max-w-32 truncate">{currentUser.fullName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    HT: {currentUser.hallTicket} | #{currentUser.rank.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Counselling Web Options Quick Indicator */}
            <button
              onClick={() => setActiveTab('counselling')}
              className="bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 active:scale-98 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="View Saved Counselling Options"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="hidden sm:inline">Options:</span>
              <span>{counsellingCount}</span>
            </button>

            {/* Mandatory Logout Button */}
            <button
              type="button"
              id="btn-logout"
              onClick={onLogout}
              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 active:scale-98 text-xs font-bold text-rose-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Logout from your student account"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
