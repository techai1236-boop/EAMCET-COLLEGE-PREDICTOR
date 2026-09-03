import React, { useState } from 'react';
import {
  BookmarkCheck,
  Trash2,
  ArrowUp,
  ArrowDown,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  PlusCircle,
  FileText,
  Building2,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { CounsellingPreference } from '../types';
import { ChanceBadge } from './ChanceBadge';

interface CounsellingListProps {
  preferences: CounsellingPreference[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onNavigateToPredictor: () => void;
}

export const CounsellingList: React.FC<CounsellingListProps> = ({
  preferences,
  onMoveUp,
  onMoveDown,
  onRemove,
  onClearAll,
  onNavigateToPredictor,
}) => {
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Copy to clipboard formatted list
  const handleCopy = () => {
    if (preferences.length === 0) return;

    let text = 'TG EAPCET 2025 - MY COUNSELLING WEB OPTIONS PREFERENCES\n';
    text += '========================================================\n\n';
    preferences.forEach((p, idx) => {
      text += `Option #${idx + 1}:\n`;
      text += `College Code : ${p.record.instCode}\n`;
      text += `College Name : ${p.record.instituteName} (${p.record.place})\n`;
      text += `Branch Code  : ${p.record.branchCode} (${p.record.branchName})\n`;
      text += `Prev Cutoff  : ${p.closingRank ? p.closingRank.toLocaleString('en-IN') : 'N/A'}\n`;
      text += `Your Rank    : ${p.studentRank.toLocaleString('en-IN')} (Chance: ${p.chance})\n`;
      text += `--------------------------------------------------------\n`;
    });
    text += '\nNote: This is a personal preference list. Enter these web options on the official tgeapcet.nic.in portal during your scheduled counselling window.';

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="my-counselling-list-page">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
            <BookmarkCheck className="w-4 h-4" />
            <span>Web Options Planner</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            My Counselling List
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Organize and prioritize your college and branch choices in sequential order (#1, #2, #3...) before submitting web options on the official portal.
          </p>
        </div>

        {preferences.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="copy-counselling-list-btn"
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Preferences</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="print-counselling-list-btn"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              id="clear-counselling-list-btn"
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Clear Confirmation Prompt */}
      {showClearConfirm && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-rose-900 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Are you sure you want to clear all {preferences.length} preferences from your list?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClearAll();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-xs"
            >
              Yes, Clear All
            </button>
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer Box */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Important Counselling Authority Notice</p>
          <p className="text-amber-800 leading-relaxed">
            &ldquo;Adding a college to My Counselling List does not submit your preferences to the official counselling authority.&rdquo;
            This list is saved privately on your device to help you plan. You must manually enter your final preferences during web counselling on the official Telangana EAPCET portal (tgeapcet.nic.in).
          </p>
        </div>
      </div>

      {/* Empty State */}
      {preferences.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Counselling List is Empty</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
              Search for your eligible colleges in the College Predictor and click &ldquo;+ Put in Counselling&rdquo; to build your prioritized web options list.
            </p>
          </div>
          <button
            type="button"
            id="empty-state-go-to-predictor-btn"
            onClick={onNavigateToPredictor}
            className="px-6 py-3 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md shadow-blue-200 transition inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open College Predictor</span>
          </button>
        </div>
      ) : (
        /* Populated Preferences List */
        <div className="space-y-3" id="preferences-items-list">
          {preferences.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === preferences.length - 1;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Priority Rank & Details */}
                <div className="flex items-start gap-3.5">
                  {/* Priority Number Pill */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-xs">
                    #{index + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-lg font-mono">
                        {item.record.instCode}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {item.record.branchCode} — {item.record.branchName}
                      </span>
                      <ChanceBadge chance={item.chance} size="sm" />
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-800">
                      {item.record.instituteName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.record.place}, Dist: {item.record.distCode}
                      </span>
                      <span>•</span>
                      <span>
                        Prev Closing Cutoff: <strong className="text-indigo-900 font-mono font-bold">{item.closingRank ? item.closingRank.toLocaleString('en-IN') : 'N/A'}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Your Rank: <strong className="text-slate-700 font-mono font-semibold">{item.studentRank.toLocaleString('en-IN')}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reorder and Delete Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onMoveUp(index)}
                    disabled={isFirst}
                    title="Move Up in Priority"
                    className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onMoveDown(index)}
                    disabled={isLast}
                    title="Move Down in Priority"
                    className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    title="Remove from List"
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
