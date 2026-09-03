import React from 'react';
import {
  X,
  User,
  Hash,
  Award,
  Phone,
  Calendar,
  BookmarkCheck,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { AdminStudentSummary } from '../services/api';

interface AdminStudentDetailModalProps {
  student: AdminStudentSummary | null;
  counsellingList: any[];
  isLoading: boolean;
  onClose: () => void;
}

export const AdminStudentDetailModal: React.FC<AdminStudentDetailModalProps> = ({
  student,
  counsellingList,
  isLoading,
  onClose,
}) => {
  if (!student) return null;

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getChanceBadge = (chance: string) => {
    switch (chance) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            HIGH CHANCE
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            MODERATE
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            LOW CHANCE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            VERY LOW
          </span>
        );
    }
  };

  return (
    <div
      id="modal-admin-student-details"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              {student.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{student.fullName}</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Student</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Hall Ticket: <span className="text-slate-200 font-semibold">{student.hallTicket}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Section 1: Complete Registration Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Complete Registration Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Student Name</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{student.fullName}</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Hall Ticket Number</span>
                </div>
                <div className="font-mono font-bold text-indigo-900 text-sm">{student.hallTicket}</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>EAMCET Rank</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  #{student.rank.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Category & Quota</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {student.category} ({student.gender === 'GIRLS' ? 'Girls Quota' : 'General / Boys'})
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Registered Mobile</span>
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">{student.mobile}</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Registration Date & Time</span>
                </div>
                <div className="font-semibold text-slate-900 text-xs">
                  {formatDate(student.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Saved Counselling List */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Saved Counselling List & Web Options</span>
              </h4>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {counsellingList.length} Options Saved
              </span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                <p>Loading student counselling list...</p>
              </div>
            ) : counsellingList.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  No Colleges Saved Yet
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  This student has not yet added any college preferences to their Counselling List.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {counsellingList.map((item, index) => {
                  const inst = item.record || {};
                  return (
                    <div
                      key={item.id || index}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xs transition flex items-start gap-3"
                    >
                      {/* Priority Rank Order */}
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        #{item.priority || index + 1}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {inst.instCode || 'COLLEGE'}
                          </span>
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {inst.branchCode || 'BRANCH'}
                          </span>
                          {item.chance && getChanceBadge(item.chance)}
                        </div>

                        <div className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                          {inst.instituteName || 'College Name Unavailable'}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {inst.branchName || ''}
                        </div>

                        <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2 font-mono">
                          {item.closingRank && (
                            <span>
                              Cutoff Rank: <strong className="text-slate-700">#{item.closingRank.toLocaleString()}</strong>
                            </span>
                          )}
                          {item.addedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{formatDate(item.addedAt)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
