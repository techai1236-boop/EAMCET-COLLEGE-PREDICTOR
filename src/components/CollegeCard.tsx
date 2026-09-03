import React from 'react';
import { BookmarkPlus, BookmarkCheck, ChevronRight, MapPin, Award } from 'lucide-react';
import { PredictionResult } from '../types';
import { ChanceBadge } from './ChanceBadge';

interface CollegeCardProps {
  item: PredictionResult;
  onSelect: (item: PredictionResult) => void;
  onToggleCounselling: (item: PredictionResult) => void;
  isInCounselling: boolean;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({
  item,
  onSelect,
  onToggleCounselling,
  isInCounselling,
}) => {
  const { record, closingRank, studentRank, chance } = item;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Top Header: Code, Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded-lg font-mono">
              {record.instCode}
            </span>
            <span className="text-[11px] text-slate-400 font-medium uppercase">
              {record.place} • {record.distCode}
            </span>
          </div>
          <ChanceBadge chance={chance} size="sm" />
        </div>

        {/* College Name & Branch */}
        <div>
          <h4 
            onClick={() => onSelect(item)}
            className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-indigo-600 transition cursor-pointer leading-snug line-clamp-2"
          >
            {record.instituteName}
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {record.branchName} • Code: <strong className="text-slate-700">{record.branchCode}</strong>
          </p>
        </div>

        {/* Cutoff Rank Comparison */}
        <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Cutoff Rank</span>
            <div className="text-xs sm:text-sm font-black text-indigo-900 font-mono">
              {closingRank ? closingRank.toLocaleString('en-IN') : 'N/A'}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Your Rank</span>
            <div className="text-xs sm:text-sm font-semibold text-slate-700 font-mono">
              {studentRank.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 mt-2 flex items-center gap-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onSelect(item)}
          className="py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>All Cutoffs</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onToggleCounselling(item)}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            isInCounselling
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
              : 'bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white'
          }`}
        >
          {isInCounselling ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>✓ In List</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>+ Put in Counselling</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
