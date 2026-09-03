import React from 'react';
import { X, Building2, MapPin, Award, Check, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { PredictionResult } from '../types';
import { ChanceBadge } from './ChanceBadge';

interface CollegeModalProps {
  item: PredictionResult | null;
  onClose: () => void;
  onToggleCounselling: (item: PredictionResult) => void;
  isInCounselling: boolean;
}

export const CollegeModal: React.FC<CollegeModalProps> = ({
  item,
  onClose,
  onToggleCounselling,
  isInCounselling,
}) => {
  if (!item) return null;

  const { record, closingRank, studentRank, chance, category, gender } = item;

  // Categories list for full cutoff breakdown table
  const categoryGroups = [
    { label: 'OC (Open Category)', keys: [{ key: 'OC_BOYS', name: 'Boys' }, { key: 'OC_GIRLS', name: 'Girls' }] },
    { label: 'EWS (10% Quota)', keys: [{ key: 'EWS_BOYS', name: 'Boys' }, { key: 'EWS_GIRLS', name: 'Girls' }] },
    { label: 'BC-A', keys: [{ key: 'BC_A_BOYS', name: 'Boys' }, { key: 'BC_A_GIRLS', name: 'Girls' }] },
    { label: 'BC-B', keys: [{ key: 'BC_B_BOYS', name: 'Boys' }, { key: 'BC_B_GIRLS', name: 'Girls' }] },
    { label: 'BC-C', keys: [{ key: 'BC_C_BOYS', name: 'Boys' }, { key: 'BC_C_GIRLS', name: 'Girls' }] },
    { label: 'BC-D', keys: [{ key: 'BC_D_BOYS', name: 'Boys' }, { key: 'BC_D_GIRLS', name: 'Girls' }] },
    { label: 'BC-E', keys: [{ key: 'BC_E_BOYS', name: 'Boys' }, { key: 'BC_E_GIRLS', name: 'Girls' }] },
    { label: 'SC Sub-group I', keys: [{ key: 'SC_I_BOYS', name: 'Boys' }, { key: 'SC_I_GIRLS', name: 'Girls' }] },
    { label: 'SC Sub-group II', keys: [{ key: 'SC_II_BOYS', name: 'Boys' }, { key: 'SC_II_GIRLS', name: 'Girls' }] },
    { label: 'SC Sub-group III', keys: [{ key: 'SC_III_BOYS', name: 'Boys' }, { key: 'SC_III_GIRLS', name: 'Girls' }] },
    { label: 'ST (Scheduled Tribe)', keys: [{ key: 'ST_BOYS', name: 'Boys' }, { key: 'ST_GIRLS', name: 'Girls' }] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        id="college-details-modal"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold tracking-wider">
                {record.instCode}
              </span>
              <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                {record.collegeType} • {record.coEducation}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {record.instituteName}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {record.place}, Dist: {record.distCode}
              </span>
              {record.affiliatedTo && (
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  Affiliated: {record.affiliatedTo}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Stat Highlights Bento Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{record.branchCode}</div>
              <div className="text-[11px] text-slate-500 truncate" title={record.branchName}>{record.branchName}</div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Rank</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5 font-mono">{studentRank.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-slate-500">{category} • {gender === 'BOYS' ? 'Male' : 'Female'}</div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prev. Closing Rank</div>
              <div className="text-sm font-bold text-indigo-900 mt-0.5 font-mono">
                {closingRank ? closingRank.toLocaleString('en-IN') : 'N/A'}
              </div>
              <div className="text-[11px] text-slate-400">Overall Cutoff</div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admission Chance</div>
              <div className="mt-1">
                <ChanceBadge chance={chance} size="sm" />
              </div>
            </div>
          </div>

          {/* Full Category Cutoff Table from dataset */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Previous-Year Closing Ranks by Category (All Quotas)
              </h4>
              <span className="text-[10px] text-slate-400">Official verified dataset</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3.5 font-bold text-slate-700">Category</th>
                      <th className="py-2.5 px-3.5 font-bold text-slate-700">Boys (General Quota)</th>
                      <th className="py-2.5 px-3.5 font-bold text-slate-700">Girls Quota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categoryGroups.map((group) => {
                      const boysKey = group.keys[0].key as keyof typeof record.cutoffs;
                      const girlsKey = group.keys[1].key as keyof typeof record.cutoffs;
                      const boysCutoff = record.cutoffs[boysKey];
                      const girlsCutoff = record.cutoffs[girlsKey];
                      const isCurrentCategory = group.label.startsWith(category);

                      return (
                        <tr
                          key={group.label}
                          className={isCurrentCategory ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'}
                        >
                          <td className="py-2 px-3.5 text-slate-800 flex items-center gap-1.5">
                            {isCurrentCategory && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                            <span>{group.label}</span>
                          </td>
                          <td className="py-2 px-3.5 text-slate-700 font-mono">
                            {boysCutoff !== null ? boysCutoff.toLocaleString('en-IN') : <span className="text-slate-400">N/A</span>}
                          </td>
                          <td className="py-2 px-3.5 text-slate-700 font-mono">
                            {girlsCutoff !== null ? girlsCutoff.toLocaleString('en-IN') : <span className="text-slate-400">N/A</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * N/A indicates no candidate was allotted under this specific category/gender quota in the official dataset.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            Close
          </button>

          <button
            id="modal-toggle-counselling-btn"
            onClick={() => onToggleCounselling(item)}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              isInCounselling
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
            }`}
          >
            {isInCounselling ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>✓ Added in Counselling List</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4" />
                <span>+ Put in Counselling List</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
