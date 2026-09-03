import React from 'react';
import { X, User, Hash, Award, Phone, ShieldCheck, LogOut, BookmarkCheck } from 'lucide-react';
import { AuthenticatedUser } from '../services/api';

interface StudentAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthenticatedUser | null;
  onLogout: () => void;
  counsellingCount: number;
}

export const StudentAccountModal: React.FC<StudentAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  counsellingCount,
}) => {
  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{currentUser.fullName}</h3>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified EAPCET Student Account</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="text-slate-500 font-medium flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-indigo-600" />
              <span>Hall Ticket</span>
            </div>
            <div className="font-mono font-bold text-slate-900 text-sm">{currentUser.hallTicket}</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="text-slate-500 font-medium flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>EAMCET Rank</span>
            </div>
            <div className="font-bold text-slate-900 text-sm">#{currentUser.rank.toLocaleString()}</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="text-slate-500 font-medium flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Category & Gender</span>
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {currentUser.category} ({currentUser.gender === 'GIRLS' ? 'Girls Quota' : 'General/Boys'})
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="text-slate-500 font-medium flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Registered Mobile</span>
            </div>
            <div className="font-bold text-slate-900 text-sm">{currentUser.mobile}</div>
          </div>
        </div>

        {/* Saved Preferences Stats */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800">Saved Web Options:</span>
          </div>
          <span className="font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-full border border-indigo-200 shadow-2xs">
            {counsellingCount} Colleges
          </span>
        </div>

        {/* Unique User ID */}
        <div className="text-[10px] text-slate-400 font-mono text-center">
          Student ID: {currentUser.id}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
