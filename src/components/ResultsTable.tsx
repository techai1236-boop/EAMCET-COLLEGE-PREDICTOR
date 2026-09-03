import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Table as TableIcon,
  BookmarkPlus,
  BookmarkCheck,
  ExternalLink,
  MapPin,
  FileCheck,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { ChanceCategory, PredictionResult, StudentInput } from '../types';
import { ChanceBadge } from './ChanceBadge';
import { CollegeCard } from './CollegeCard';
import { DebugPanel, DebugStats } from './DebugPanel';

interface ResultsTableProps {
  results: PredictionResult[];
  studentInput: StudentInput;
  onSelectCollege: (item: PredictionResult) => void;
  onToggleCounselling: (item: PredictionResult) => void;
  counsellingIds: Set<string>;
  debugStats?: DebugStats;
  normalizedBranch?: string;
  onOpenValidationReport?: () => void;
}

type SortField = 'closingRank' | 'instituteName' | 'chance';
type SortOrder = 'asc' | 'desc';

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  studentInput,
  onSelectCollege,
  onToggleCounselling,
  counsellingIds,
  debugStats,
  normalizedBranch = 'CSM',
  onOpenValidationReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chanceFilter, setChanceFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('closingRank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Reset to ascending order of previous year closing rank when new predictions arrive
  useEffect(() => {
    setSortField('closingRank');
    setSortOrder('asc');
  }, [results, studentInput]);

  // Dynamic statistics calculated directly from the current matched predictions
  const stats = useMemo(() => {
    let high = 0;
    let moderate = 0;
    let low = 0;
    let veryLow = 0;

    for (const r of results) {
      if (r.chance === 'HIGH') high++;
      else if (r.chance === 'MODERATE') moderate++;
      else if (r.chance === 'LOW') low++;
      else if (r.chance === 'VERY_LOW') veryLow++;
    }

    return { total: results.length, high, moderate, low, veryLow };
  }, [results]);

  // Unique branches in current matched results
  const availableBranches = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) {
      set.add(r.record.branchCode);
    }
    return Array.from(set).sort();
  }, [results]);

  // Filtering & Sorting
  const filteredAndSortedResults = useMemo(() => {
    return results
      .filter((item) => {
        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = item.record.instituteName.toLowerCase().includes(q);
          const matchCode = item.record.instCode.toLowerCase().includes(q);
          const matchBranch =
            item.record.branchName.toLowerCase().includes(q) ||
            item.record.branchCode.toLowerCase().includes(q);
          const matchPlace = item.record.place.toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchBranch && !matchPlace) return false;
        }

        // Chance filter
        if (chanceFilter !== 'ALL' && item.chance !== chanceFilter) {
          return false;
        }

        // Branch filter
        if (branchFilter !== 'ALL' && item.record.branchCode !== branchFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'closingRank') {
          const rankA = a.closingRank || 999999;
          const rankB = b.closingRank || 999999;
          diff = rankA - rankB;
          if (diff === 0) {
            diff = a.record.instituteName.localeCompare(b.record.instituteName);
          }
        } else if (sortField === 'instituteName') {
          diff = a.record.instituteName.localeCompare(b.record.instituteName);
          if (diff === 0) {
            diff = (a.closingRank || 999999) - (b.closingRank || 999999);
          }
        } else if (sortField === 'chance') {
          const priority: Record<ChanceCategory, number> = {
            HIGH: 1,
            MODERATE: 2,
            LOW: 3,
            VERY_LOW: 4,
          };
          diff = priority[a.chance] - priority[b.chance];
          if (diff === 0) {
            diff = (a.closingRank || 999999) - (b.closingRank || 999999);
          }
        }

        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [results, searchTerm, chanceFilter, branchFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleChanceClick = (target: string) => {
    if (chanceFilter === target) {
      setChanceFilter('ALL');
    } else {
      setChanceFilter(target);
    }
  };

  return (
    <div className="space-y-6" id="prediction-results-container">
      {/* 11. RESULTS HEADER BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        {/* Top query summary: Rank, Category, Gender, Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-5 border-b border-slate-100">
          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">
              Your Rank
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-950 font-mono mt-0.5 block">
              {studentInput.rank.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Category
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">
              {studentInput.category}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Gender
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">
              {studentInput.gender === 'BOYS' ? 'Male (BOYS)' : 'Female (GIRLS)'}
            </span>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">
              Branch Code
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-900 mt-0.5 block truncate">
              {studentInput.preferredBranch === 'ALL' ? 'ALL BRANCHES' : studentInput.preferredBranch}
            </span>
          </div>
        </div>

        {/* 11. CHANCE BREAKDOWN PILLS & INTERACTIVE FILTERS */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Admission Chance Distribution ({stats.total} Total Matched)
            </span>
            <div className="flex items-center gap-2">
              {onOpenValidationReport && (
                <button
                  type="button"
                  id="btn-open-validation-report"
                  onClick={onOpenValidationReport}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Cutoff Audit Report</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* High Chance */}
            <button
              type="button"
              id="filter-chance-high"
              onClick={() => handleChanceClick('HIGH')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                chanceFilter === 'HIGH'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950 hover:bg-emerald-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  🟢 High Chance
                </span>
                {chanceFilter === 'HIGH' && (
                  <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                    Filtered
                  </span>
                )}
              </div>
              <div className="mt-2 text-xl font-black font-mono">
                {stats.high} <span className="text-xs font-medium font-sans">colleges</span>
              </div>
            </button>

            {/* Moderate Chance */}
            <button
              type="button"
              id="filter-chance-moderate"
              onClick={() => handleChanceClick('MODERATE')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                chanceFilter === 'MODERATE'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-amber-50/80 border-amber-200/90 text-amber-950 hover:bg-amber-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  🟡 Moderate Chance
                </span>
                {chanceFilter === 'MODERATE' && (
                  <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                    Filtered
                  </span>
                )}
              </div>
              <div className="mt-2 text-xl font-black font-mono">
                {stats.moderate} <span className="text-xs font-medium font-sans">colleges</span>
              </div>
            </button>

            {/* Low / Borderline Chance */}
            <button
              type="button"
              id="filter-chance-low"
              onClick={() => handleChanceClick('LOW')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                chanceFilter === 'LOW'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-400/40'
                  : 'bg-orange-50/80 border-orange-200/90 text-orange-950 hover:bg-orange-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
                  🟠 Low / Borderline
                </span>
                {chanceFilter === 'LOW' && (
                  <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                    Filtered
                  </span>
                )}
              </div>
              <div className="mt-2 text-xl font-black font-mono">
                {stats.low} <span className="text-xs font-medium font-sans">colleges</span>
              </div>
            </button>

            {/* Very Low Chance */}
            <button
              type="button"
              id="filter-chance-very-low"
              onClick={() => handleChanceClick('VERY_LOW')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                chanceFilter === 'VERY_LOW'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400/40'
                  : 'bg-rose-50/80 border-rose-200/90 text-rose-950 hover:bg-rose-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  🔴 Very Low Chance
                </span>
                {chanceFilter === 'VERY_LOW' && (
                  <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                    Filtered
                  </span>
                )}
              </div>
              <div className="mt-2 text-xl font-black font-mono">
                {stats.veryLow} <span className="text-xs font-medium font-sans">colleges</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 10. DEVELOPER / DEBUG ENGINE DIAGNOSTICS */}
      {debugStats && (
        <DebugPanel
          stats={debugStats}
          studentInput={studentInput}
          normalizedBranch={normalizedBranch}
        />
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="results-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search college name, code (KGRH, AVNI, CBIT...), or district..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          {/* Controls: Chance Filter, Branch Filter, Sort, View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Sort Button: Ascending Cutoff Rank */}
            <button
              type="button"
              id="btn-sort-rank"
              onClick={() => handleSort('closingRank')}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                sortField === 'closingRank'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Sort by previous-year closing rank in ascending order"
            >
              <span>Cutoff Rank</span>
              {sortField === 'closingRank' ? (
                sortOrder === 'asc' ? (
                  <span className="inline-flex items-center text-indigo-700 gap-0.5 font-mono">
                    <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Asc (Lowest first)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center text-indigo-700 gap-0.5 font-mono">
                    <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Desc</span>
                  </span>
                )
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Chance Filter Select */}
            <div className="relative">
              <select
                id="filter-chance-select"
                value={chanceFilter}
                onChange={(e) => setChanceFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="ALL">All Chances ({stats.total})</option>
                <option value="HIGH">🟢 High Chance ({stats.high})</option>
                <option value="MODERATE">🟡 Moderate Chance ({stats.moderate})</option>
                <option value="LOW">🟠 Low Chance ({stats.low})</option>
                <option value="VERY_LOW">🔴 Very Low Chance ({stats.veryLow})</option>
              </select>
            </div>

            {/* Branch Filter */}
            {availableBranches.length > 1 && (
              <div className="relative">
                <select
                  id="filter-branch-select"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="ALL">All Branches ({availableBranches.length})</option>
                  {availableBranches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white shadow-2xs text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white shadow-2xs text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter count feedback */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredAndSortedResults.length}</span> of{' '}
            {results.length} colleges
            {chanceFilter !== 'ALL' && (
              <span className="ml-1 text-indigo-600 font-semibold">
                (Filtered by {chanceFilter} chance)
              </span>
            )}
            {searchTerm && <span> matching &ldquo;{searchTerm}&rdquo;</span>}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50/70 px-2.5 py-1 rounded-lg w-fit border border-indigo-100">
            <ArrowUp className="w-3 h-3 stroke-[2.5]" />
            <span>Ordered in Ascending Order of Previous-Year Cutoff Rank</span>
          </div>
        </div>
      </div>

      {/* 11. RESULTS DISPLAY */}
      {filteredAndSortedResults.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching colleges found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your filters or selecting &ldquo;All Chances&rdquo; to view every matched college.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setChanceFilter('ALL');
              setBranchFilter('ALL');
            }}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer"
          >
            Clear Active Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Desktop Table View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Predicted Colleges ({filteredAndSortedResults.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Click college name for all quota cutoffs
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse" id="prediction-results-table">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition select-none"
                    onClick={() => handleSort('instituteName')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>College</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">College Code</th>
                  <th className="py-3.5 px-3">Branch & Code</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition select-none"
                    onClick={() => handleSort('closingRank')}
                    title="Sort by previous-year closing rank in ascending order"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={sortField === 'closingRank' ? 'text-indigo-900 font-black' : ''}>
                        Prev-Year Cutoff Rank
                      </span>
                      {sortField === 'closingRank' ? (
                        sortOrder === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Your Rank</th>
                  <th className="py-3.5 px-3">Category & Gender</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition select-none"
                    onClick={() => handleSort('chance')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Chance</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedResults.map((item) => {
                  const isInCounselling = counsellingIds.has(item.record.id);

                  return (
                    <tr key={item.record.id} className="hover:bg-slate-50/80 transition group">
                      {/* College Name & Location */}
                      <td className="py-3.5 px-4">
                        <div>
                          <button
                            type="button"
                            onClick={() => onSelectCollege(item)}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition text-left leading-snug flex items-center gap-1 cursor-pointer"
                          >
                            <span>{item.record.instituteName}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                          </button>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.record.place}, Dist: {item.record.distCode}
                            </span>
                            <span>•</span>
                            <span className="uppercase">{item.record.collegeType}</span>
                          </div>
                        </div>
                      </td>

                      {/* College Code */}
                      <td className="py-3.5 px-3">
                        <span className="text-xs font-bold text-indigo-600 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg font-mono">
                          {item.record.instCode}
                        </span>
                      </td>

                      {/* Branch & Code */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800 text-xs sm:text-sm">
                          {item.record.branchCode}
                        </div>
                        <div
                          className="text-[11px] text-slate-500 truncate max-w-44"
                          title={item.record.branchName}
                        >
                          {item.record.branchName}
                        </div>
                      </td>

                      {/* Previous-Year Closing Rank */}
                      <td className="py-3.5 px-4 font-mono font-black text-indigo-900 text-sm">
                        {item.closingRank ? item.closingRank.toLocaleString('en-IN') : 'N/A'}
                      </td>

                      {/* Your Rank */}
                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-700 text-sm">
                        {item.studentRank.toLocaleString('en-IN')}
                      </td>

                      {/* Category & Gender */}
                      <td className="py-3.5 px-3 text-xs text-slate-600">
                        <span className="font-bold text-slate-800">{item.category}</span>{' '}
                        <span>({item.gender === 'BOYS' ? 'Male' : 'Female'})</span>
                      </td>

                      {/* Chance */}
                      <td className="py-3.5 px-4">
                        <ChanceBadge chance={item.chance} size="md" />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onToggleCounselling(item)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer ${
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Mobile Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="prediction-cards-grid">
          {filteredAndSortedResults.map((item) => (
            <CollegeCard
              key={item.record.id}
              item={item}
              onSelect={onSelectCollege}
              onToggleCounselling={onToggleCounselling}
              isInCounselling={counsellingIds.has(item.record.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
