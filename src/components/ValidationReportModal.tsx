import React from 'react';
import { X, FileCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { generateValidationReport } from '../utils/validationReport';

interface ValidationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValidationReportModal: React.FC<ValidationReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const report = generateValidationReport();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                TG EAPCET Cutoff Data Validation Report
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Official Telangana State Cutoff Extraction & Mapping Audit
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                Colleges Extracted
              </span>
              <span className="text-2xl font-black text-indigo-950 mt-1 block">
                {report.totalColleges}
              </span>
            </div>
            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                Branches Extracted
              </span>
              <span className="text-2xl font-black text-emerald-950 mt-1 block">
                {report.totalBranches}
              </span>
            </div>
            <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-100">
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">
                Valid Cutoff Records
              </span>
              <span className="text-2xl font-black text-sky-950 mt-1 block">
                {report.totalRecords}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Invalid Ranks
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {report.invalidClosingRanks}
              </span>
            </div>
          </div>

          {/* Audit Verification Note */}
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Extraction & Numeric Parsing Verified: </span>
              All closing ranks are converted directly into valid integers (stripping commas, trailing spaces, and formatting artifacts). There are no round/phase fields since the official source provides overall final previous-year closing rank statements.
            </div>
          </div>

          {/* 10 Sample Extracted Records */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Sample 10 Extracted Records (Audit Comparison)
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">College</th>
                    <th className="py-2.5 px-2">Code</th>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2">Gender</th>
                    <th className="py-2.5 px-3 text-right">Closing Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.sampleRecords.map((sample, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-2 px-3 font-semibold text-slate-800 max-w-[200px] truncate" title={sample.instituteName}>
                        {sample.instituteName}
                      </td>
                      <td className="py-2 px-2 font-mono font-bold text-indigo-600">
                        {sample.instCode}
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        <span className="font-bold">{sample.branchCode}</span> - <span className="text-[11px] text-slate-500">{sample.branchName}</span>
                      </td>
                      <td className="py-2 px-2 font-mono text-slate-700 font-semibold">
                        {sample.category}
                      </td>
                      <td className="py-2 px-2 text-slate-700">
                        {sample.gender === 'BOYS' ? 'Male' : 'Female'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-indigo-900">
                        {sample.closingRank.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Close Audit Report
          </button>
        </div>
      </div>
    </div>
  );
};
