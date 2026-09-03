import React, { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, Database, Filter, Info, ShieldCheck } from 'lucide-react';
import { StudentInput } from '../types';

export interface DebugStats {
  totalLoaded: number;
  matchingBranch: number;
  matchingGender: number;
  matchingCategoryCutoff: number;
  finalPredicted: number;
  excludedBranchMismatch: number;
  excludedGirlsOnly: number;
  excludedNoCutoff: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  veryLowCount: number;
}

interface DebugPanelProps {
  stats: DebugStats;
  studentInput: StudentInput;
  normalizedBranch: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ stats, studentInput, normalizedBranch }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 shadow-md overflow-hidden text-xs">
      <button
        type="button"
        id="btn-toggle-debug"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left font-mono font-bold hover:bg-slate-800 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300">Developer / Debug Engine Diagnostics</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 font-mono">
            {stats.finalPredicted} Predicted
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-[11px]">{isOpen ? 'Hide Panel' : 'Show Debug Metrics'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-slate-800 space-y-4 bg-slate-950 font-mono">
          {/* Query Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 block">Student Rank:</span>
              <span className="text-white font-bold">{studentInput.rank.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Category:</span>
              <span className="text-white font-bold">{studentInput.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Gender:</span>
              <span className="text-white font-bold">{studentInput.gender === 'BOYS' ? 'Male (BOYS)' : 'Female (GIRLS)'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Normalized Branch:</span>
              <span className="text-emerald-400 font-bold">{normalizedBranch}</span>
            </div>
          </div>

          {/* Engine Processing Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Total Records Loaded:</span>
              <span className="text-base font-black text-indigo-400">{stats.totalLoaded}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Records Matching Branch:</span>
              <span className="text-base font-black text-sky-400">{stats.matchingBranch}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Matching Gender / Coed:</span>
              <span className="text-base font-black text-emerald-400">{stats.matchingGender}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">With Valid Closing Rank:</span>
              <span className="text-base font-black text-amber-400">{stats.matchingCategoryCutoff}</span>
            </div>
          </div>

          {/* Exclusion Breakdown */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Why Records Were Excluded:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex justify-between items-center bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-800">
                <span className="text-slate-400">Branch Mismatch:</span>
                <span className="font-bold text-rose-400">{stats.excludedBranchMismatch}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-800">
                <span className="text-slate-400">Girls-only Excluded (Male):</span>
                <span className="font-bold text-rose-400">{stats.excludedGirlsOnly}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-800">
                <span className="text-slate-400">No Cutoff in Quota:</span>
                <span className="font-bold text-rose-400">{stats.excludedNoCutoff}</span>
              </div>
            </div>
          </div>

          {/* Chance Distribution */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Final Chance Distribution:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-emerald-950/60 border border-emerald-800/60 p-2 rounded-lg text-emerald-300 font-bold flex justify-between">
                <span>🟢 High:</span>
                <span>{stats.highCount}</span>
              </div>
              <div className="bg-amber-950/60 border border-amber-800/60 p-2 rounded-lg text-amber-300 font-bold flex justify-between">
                <span>🟡 Moderate:</span>
                <span>{stats.moderateCount}</span>
              </div>
              <div className="bg-orange-950/60 border border-orange-800/60 p-2 rounded-lg text-orange-300 font-bold flex justify-between">
                <span>🟠 Low / Borderline:</span>
                <span>{stats.lowCount}</span>
              </div>
              <div className="bg-rose-950/60 border border-rose-800/60 p-2 rounded-lg text-rose-300 font-bold flex justify-between">
                <span>🔴 Very Low:</span>
                <span>{stats.veryLowCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
