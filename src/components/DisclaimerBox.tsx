import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface DisclaimerBoxProps {
  compact?: boolean;
}

export const DisclaimerBox: React.FC<DisclaimerBoxProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Official Disclaimer</p>
          <p className="text-amber-800/90 mt-0.5 leading-relaxed">
            These predictions are based on previous-year EAMCET/TG EAPCET overall closing-rank data and are intended for guidance only. No admission is guaranteed. Adding a college to My Counselling List does not submit your preferences to the official counselling authority.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 my-6 shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-base">Important Disclaimer</h4>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
              TG EAPCET Guidance
            </span>
          </div>

          <p className="leading-relaxed text-slate-600">
            &ldquo;These predictions are based on previous-year EAMCET/TG EAPCET overall closing-rank data and are intended for guidance only. Actual cutoffs and seat allotments may change every year depending on competition, seat availability, reservation rules, candidate preferences, and counselling policies. No admission is guaranteed.&rdquo;
          </p>

          <div className="flex items-start gap-2 pt-1 border-t border-slate-200 text-slate-600 text-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              &ldquo;Adding a college to My Counselling List does not submit your preferences to the official counselling authority.&rdquo; This tool provides a personal offline preference planner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
