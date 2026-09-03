import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Building2,
  BookOpen,
  ListOrdered,
  HelpCircle,
  Award,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { UNIQUE_COLLEGES, UNIQUE_BRANCHES } from '../data/colleges';

interface HomeOverviewProps {
  onStartPredictor: () => void;
  onOpenCounselling: () => void;
  counsellingCount: number;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onStartPredictor,
  onOpenCounselling,
  counsellingCount,
}) => {
  return (
    <div className="space-y-6" id="home-overview-view">
      {/* Bento Grid Top Section: Hero + Quick Stats Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bento Hero Card (col-span-2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Official Previous-Year TSCHE Cutoffs</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              EAMCET / TG EAPCET <br />
              <span className="text-indigo-600">College & Branch Predictor</span>
            </h1>

            <p className="text-sm text-slate-500 leading-relaxed">
              Compare your rank against authentic closing ranks across top Telangana engineering universities and colleges. Calculate accurate admission probability for your category and create prioritized counselling web options.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6 mt-4 border-t border-slate-100 relative z-10">
            <button
              type="button"
              id="hero-start-predictor-btn"
              onClick={onStartPredictor}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Launch College Predictor</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenCounselling}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>My Counselling List</span>
              {counsellingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                  {counsellingCount}
                </span>
              )}
            </button>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-indigo-50/60 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Right Dark Bento Tile: Counselling Summary */}
        <div className="bg-slate-900 rounded-3xl p-7 text-white flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Web Options</span>
              <span className="bg-indigo-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {counsellingCount} Selected
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold">Smart Counselling Planner</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Curate your favorite colleges in order of preference (#1, #2, #3...). Review chances before submitting options on the official tgeapcet.nic.in portal.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No counselling phase guesswork</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Drag-and-drop or 1-click reordering</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant preference print & copy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{UNIQUE_COLLEGES.length}+</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Premier Institutions</div>
          <div className="text-[11px] text-slate-400 mt-1">JNTUH, OU, CBIT, VNR, CVR...</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{UNIQUE_BRANCHES.length}+</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Engineering Branches</div>
          <div className="text-[11px] text-slate-400 mt-1">CSE, AI&ML, Data Science, ECE...</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">22</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Quota Categories</div>
          <div className="text-[11px] text-slate-400 mt-1">OC, BC-A/B/C/D/E, SC, ST, EWS</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">100%</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Verified Closing Ranks</div>
          <div className="text-[11px] text-slate-400 mt-1">Authentic TSCHE dataset cutoffs</div>
        </div>
      </div>

      {/* How the Predictor Works Bento */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          How the EAPCET Predictor Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              1
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Enter Rank & Reservation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provide your rank, gender, and social category (OC, BC groups, SC, ST, EWS). Female students are evaluated for both Girls and Boys unreserved seats.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              2
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Intelligent Cutoff Analysis</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Compares your rank against the overall previous-year closing rank. Classifies each college into <strong className="text-emerald-600">High</strong>, <strong className="text-amber-600">Moderate</strong>, <strong className="text-orange-600">Low</strong>, and <strong className="text-rose-600">Very Low</strong> chances.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              3
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Organize Web Options</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add preferred colleges into <strong className="text-indigo-600">My Counselling List</strong>, prioritize them in order (#1, #2, #3...), and print or copy them for web options submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
