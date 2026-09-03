import React, { useState } from 'react';
import { Sparkles, RotateCcw, Building2, BookOpen, User, Hash, SlidersHorizontal } from 'lucide-react';
import { Category, Gender, StudentInput } from '../types';
import { CATEGORIES_LIST, UNIQUE_BRANCHES, UNIQUE_COLLEGES } from '../data/colleges';
import { parseRankInput } from '../utils/normalizer';

interface PredictorFormProps {
  initialValues: StudentInput;
  onPredict: (input: StudentInput) => void;
  isLoading?: boolean;
  layout?: 'bento-aside' | 'horizontal';
}

export const PredictorForm: React.FC<PredictorFormProps> = ({
  initialValues,
  onPredict,
  isLoading = false,
  layout = 'bento-aside',
}) => {
  const [rank, setRank] = useState<string>(initialValues.rank > 0 ? initialValues.rank.toString() : '');
  const [category, setCategory] = useState<Category>(initialValues.category);
  const [gender, setGender] = useState<Gender>(initialValues.gender);
  const [preferredBranch, setPreferredBranch] = useState<string>(initialValues.preferredBranch);
  const [preferredCollege, setPreferredCollege] = useState<string>(initialValues.preferredCollege || 'ALL');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rankNum = parseRankInput(rank);

    if (isNaN(rankNum) || rankNum <= 0) {
      setError('Please enter a valid positive EAMCET rank (e.g., 12500 or 1,24,972)');
      return;
    }

    if (rankNum > 250000) {
      setError('EAMCET ranks are typically between 1 and 200,000. Please check your rank.');
      return;
    }

    setError(null);
    onPredict({
      rank: rankNum,
      category,
      gender,
      preferredBranch,
      preferredCollege: preferredCollege === 'ALL' ? undefined : preferredCollege,
    });
  };

  const handleReset = () => {
    setRank('');
    setCategory('OC');
    setGender('BOYS');
    setPreferredBranch('ALL');
    setPreferredCollege('ALL');
    setError(null);
  };

  const setPresetRank = (val: number) => {
    setRank(val.toString());
    setError(null);
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
      {/* Bento Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          <span>Predictor Form</span>
        </h2>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition"
          title="Reset filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="space-y-4" id="predictor-form">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-1.5">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* 1. EAMCET Rank */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="student-rank-input" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              EAMCET Rank <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400">1 - 2,00,000</span>
          </div>
          <input
            id="student-rank-input"
            type="text"
            inputMode="numeric"
            required
            value={rank}
            onChange={(e) => {
              setRank(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. 12500 or 1,24,972"
            className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
          />
          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Try:</span>
            {[3500, 12500, 45000, 85000, 124972].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setPresetRank(r)}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-medium transition"
              >
                {r.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Category */}
        <div>
          <label htmlFor="student-category-select" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            id="student-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition cursor-pointer"
          >
            {CATEGORIES_LIST.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Gender */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Gender <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              id="gender-boys"
              onClick={() => setGender('BOYS')}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                gender === 'BOYS'
                  ? 'border border-indigo-600 bg-indigo-50 text-indigo-600 shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Male</span>
              <span className="text-[10px] opacity-75">(Boys Quota)</span>
            </button>
            <button
              type="button"
              id="gender-girls"
              onClick={() => setGender('GIRLS')}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                gender === 'GIRLS'
                  ? 'border border-indigo-600 bg-indigo-50 text-indigo-600 shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Female</span>
              <span className="text-[10px] opacity-75">(Girls + Boys)</span>
            </button>
          </div>
        </div>

        {/* 4. Preferred Branch */}
        <div>
          <label htmlFor="preferred-branch-select" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Preferred Branch
          </label>
          <select
            id="preferred-branch-select"
            value={preferredBranch}
            onChange={(e) => setPreferredBranch(e.target.value)}
            className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition cursor-pointer"
          >
            <option value="ALL">Any Branch (Show All)</option>
            {UNIQUE_BRANCHES.map((b) => (
              <option key={b.code} value={b.code}>
                {b.code} — {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Preferred College */}
        <div>
          <label htmlFor="preferred-college-select" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Preferred College <span className="text-[10px] font-normal text-slate-400 lowercase">(optional)</span>
          </label>
          <select
            id="preferred-college-select"
            value={preferredCollege}
            onChange={(e) => setPreferredCollege(e.target.value)}
            className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition cursor-pointer"
          >
            <option value="ALL">Any College (Explore All)</option>
            {UNIQUE_COLLEGES.map((c) => (
              <option key={c.code} value={c.code}>
                [{c.code}] {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Big Bento Action Button */}
        <button
          type="submit"
          id="predict-colleges-btn"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm mt-3 disabled:opacity-60"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Predict Colleges</span>
        </button>

        <p className="text-[10px] text-center text-slate-400">
          Official previous-year TSCHE closing cutoffs
        </p>
      </form>
    </div>
  );
};
