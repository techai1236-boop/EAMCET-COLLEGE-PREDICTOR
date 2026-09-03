/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { PredictorForm } from './components/PredictorForm';
import { ResultsTable } from './components/ResultsTable';
import { CounsellingList } from './components/CounsellingList';
import { CollegeModal } from './components/CollegeModal';
import { DisclaimerBox } from './components/DisclaimerBox';
import { DebugStats } from './components/DebugPanel';
import { ValidationReportModal } from './components/ValidationReportModal';
import { StudentAccountModal } from './components/StudentAccountModal';
import { AuthPage } from './components/AuthPage';
import { COLLEGES_DATA, getClosingRank } from './data/colleges';
import { calculateChance } from './config/predictorConfig';
import {
  matchesBranch,
  normalizeBranchCode,
  normalizeCategory,
  normalizeGender,
  parseRankInput,
} from './utils/normalizer';
import { CounsellingPreference, PredictionResult, StudentInput } from './types';
import {
  AuthenticatedUser,
  AuthenticatedAdmin,
  authStorage,
  adminAuthStorage,
  checkCurrentSession,
  checkCurrentAdminSession,
  fetchStudentCounselling,
  logoutStudent,
  logoutAdmin,
  saveStudentCounselling,
} from './services/api';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export default function App() {
  // Session & User Authentication State
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AuthenticatedAdmin | null>(null);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
  );

  // Synchronous initial auth check: only show loading if a token actually exists to verify
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      return !!adminAuthStorage.getToken();
    }
    return !!authStorage.getToken();
  });

  // Keep references for stable event listeners without re-triggering effects
  const currentUserRef = useRef<AuthenticatedUser | null>(null);
  currentUserRef.current = currentUser;

  const currentAdminRef = useRef<AuthenticatedAdmin | null>(null);
  currentAdminRef.current = currentAdmin;

  // Active view tab (when authenticated)
  const [activeTab, setActiveTab] = useState<'predictor' | 'counselling'>('predictor');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

  // Student Input State
  const [studentInput, setStudentInput] = useState<StudentInput>({
    rank: 124972,
    category: 'OC',
    gender: 'BOYS',
    preferredBranch: 'ALL',
    preferredCollege: 'ALL',
  });

  const [hasPredicted, setHasPredicted] = useState<boolean>(false);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [debugStats, setDebugStats] = useState<DebugStats | undefined>(undefined);
  const [selectedCollegeForModal, setSelectedCollegeForModal] = useState<PredictionResult | null>(null);

  // Counselling list specific to currently logged-in student (loaded from backend database)
  const [counsellingList, setCounsellingList] = useState<CounsellingPreference[]>([]);

  // O(1) lookup set for counselling list IDs
  const counsellingIds = useMemo(() => {
    return new Set(counsellingList.map((item) => item.id));
  }, [counsellingList]);

  // Run prediction logic with complete normalizer and debug stats tracking
  const handlePredict = useCallback((rawInput: StudentInput) => {
    // 1. Sanitize & Normalize Inputs
    const cleanRank = parseRankInput(rawInput.rank);
    const cleanCategory = normalizeCategory(rawInput.category);
    const cleanGender = normalizeGender(rawInput.gender);
    const targetBranch = rawInput.preferredBranch || 'ALL';
    const targetCollege = rawInput.preferredCollege || 'ALL';

    const normalizedInput: StudentInput = {
      rank: cleanRank,
      category: cleanCategory,
      gender: cleanGender,
      preferredBranch: targetBranch,
      preferredCollege: targetCollege === 'ALL' ? undefined : targetCollege,
    };

    setStudentInput(normalizedInput);

    const matchedResults: PredictionResult[] = [];

    let matchingBranchCount = 0;
    let matchingGenderCount = 0;
    let matchingCategoryCutoffCount = 0;
    let excludedBranchMismatch = 0;
    let excludedGirlsOnly = 0;
    let excludedNoCutoff = 0;

    let highCount = 0;
    let moderateCount = 0;
    let lowCount = 0;
    let veryLowCount = 0;

    for (const record of COLLEGES_DATA) {
      // 1. College filter
      if (normalizedInput.preferredCollege && normalizedInput.preferredCollege !== 'ALL') {
        if (record.instCode !== normalizedInput.preferredCollege) {
          continue;
        }
      }

      // 2. Branch matching (using aliases and normalization)
      const branchMatches = matchesBranch(
        record.branchCode,
        record.branchName,
        normalizedInput.preferredBranch
      );

      if (!branchMatches) {
        excludedBranchMismatch++;
        continue;
      }
      matchingBranchCount++;

      // 3. Gender / Institution Coed eligibility
      if (record.coEducation === 'GIRLS' && normalizedInput.gender === 'BOYS') {
        excludedGirlsOnly++;
        continue;
      }
      matchingGenderCount++;

      // 4. Get closing rank for selected category and gender
      const closingRank = getClosingRank(
        record,
        normalizedInput.category,
        normalizedInput.gender
      );

      if (closingRank === null || isNaN(closingRank) || closingRank <= 0) {
        excludedNoCutoff++;
        continue;
      }

      matchingCategoryCutoffCount++;

      // 5. Calculate chance
      const chance = calculateChance(normalizedInput.rank, closingRank);

      if (chance === 'HIGH') highCount++;
      else if (chance === 'MODERATE') moderateCount++;
      else if (chance === 'LOW') lowCount++;
      else if (chance === 'VERY_LOW') veryLowCount++;

      matchedResults.push({
        record,
        closingRank,
        studentRank: normalizedInput.rank,
        chance,
        category: normalizedInput.category,
        gender: normalizedInput.gender,
      });
    }

    // Ascending order of closing rank (Lowest to Highest cutoff)
    matchedResults.sort((a, b) => {
      const rankA = a.closingRank || 999999;
      const rankB = b.closingRank || 999999;
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return a.record.instituteName.localeCompare(b.record.instituteName);
    });

    const dStats: DebugStats = {
      totalLoaded: COLLEGES_DATA.length,
      matchingBranch: matchingBranchCount,
      matchingGender: matchingGenderCount,
      matchingCategoryCutoff: matchingCategoryCutoffCount,
      finalPredicted: matchedResults.length,
      excludedBranchMismatch,
      excludedGirlsOnly,
      excludedNoCutoff,
      highCount,
      moderateCount,
      lowCount,
      veryLowCount,
    };

    setDebugStats(dStats);
    setResults(matchedResults);
    setHasPredicted(true);
    setActiveTab('predictor');
  }, []);

  // 1. Initial Authentication Check on App Load (Runs strictly once on mount)
  useEffect(() => {
    let isCancelled = false;

    async function verifyAuth() {
      const pathname = window.location.pathname;

      if (pathname.startsWith('/admin')) {
        setIsAdminRoute(true);
        if (!adminAuthStorage.getToken()) {
          if (!isCancelled) {
            setCurrentAdmin(null);
            if (pathname !== '/admin/login') {
              window.history.replaceState(null, '', '/admin/login');
            }
            setIsCheckingAuth(false);
          }
          return;
        }

        try {
          const admin = await checkCurrentAdminSession();
          if (isCancelled) return;
          if (admin) {
            setCurrentAdmin(admin);
            if (pathname === '/admin' || pathname === '/admin/login') {
              window.history.replaceState(null, '', '/admin/dashboard');
            }
          } else {
            setCurrentAdmin(null);
            if (pathname !== '/admin/login') {
              window.history.replaceState(null, '', '/admin/login');
            }
          }
        } catch (e) {
          if (!isCancelled) {
            console.error('Admin session check failed', e);
            setCurrentAdmin(null);
            window.history.replaceState(null, '', '/admin/login');
          }
        } finally {
          if (!isCancelled) {
            setIsCheckingAuth(false);
          }
        }
        return;
      }

      // Student Route Verification
      setIsAdminRoute(false);
      if (!authStorage.getToken()) {
        if (!isCancelled) {
          setCurrentUser(null);
          if (pathname !== '/register') {
            window.history.replaceState(null, '', '/login');
          }
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const user = await checkCurrentSession();
        if (isCancelled) return;
        if (user) {
          setCurrentUser(user);
          // Pre-populate student input with user's verified details
          const initialInput: StudentInput = {
            rank: user.rank,
            category: normalizeCategory(user.category),
            gender: normalizeGender(user.gender),
            preferredBranch: 'ALL',
            preferredCollege: 'ALL',
          };
          setStudentInput(initialInput);

          // Fetch student's specific saved counselling preferences from backend database
          const savedPrefs = await fetchStudentCounselling();
          if (!isCancelled) {
            setCounsellingList(savedPrefs);
            handlePredict(initialInput);

            if (
              pathname === '/' ||
              pathname === '/login' ||
              pathname === '/register'
            ) {
              window.history.replaceState(null, '', '/predictor');
            }
          }
        } else {
          setCurrentUser(null);
          if (pathname !== '/register') {
            window.history.replaceState(null, '', '/login');
          }
        }
      } catch (e) {
        if (!isCancelled) {
          console.error('Student session check failed', e);
          setCurrentUser(null);
          window.history.replaceState(null, '', '/login');
        }
      } finally {
        if (!isCancelled) {
          setIsCheckingAuth(false);
        }
      }
    }

    verifyAuth();

    // Listen to browser navigation (back/forward) to enforce protected routes
    const handlePopState = async () => {
      const path = window.location.pathname;

      if (path.startsWith('/admin')) {
        setIsAdminRoute(true);
        if (!adminAuthStorage.getToken()) {
          setCurrentAdmin(null);
          if (path !== '/admin/login') {
            window.history.replaceState(null, '', '/admin/login');
          }
          return;
        }

        const admin = await checkCurrentAdminSession();
        if (!admin) {
          setCurrentAdmin(null);
          if (path !== '/admin/login') {
            window.history.replaceState(null, '', '/admin/login');
          }
        } else {
          setCurrentAdmin(admin);
          if (path === '/admin' || path === '/admin/login') {
            window.history.replaceState(null, '', '/admin/dashboard');
          }
        }
        return;
      }

      setIsAdminRoute(false);
      const user = currentUserRef.current;
      if (!user) {
        if (path === '/register') {
          // allow register view
        } else {
          window.history.replaceState(null, '', '/login');
        }
      } else {
        if (path === '/counselling') {
          setActiveTab('counselling');
        } else if (path === '/account') {
          setIsAccountModalOpen(true);
        } else {
          setActiveTab('predictor');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      isCancelled = true;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handlePredict]);

  // Navigate to Administrator Portal
  const navigateToAdmin = async () => {
    setIsAdminRoute(true);
    if (!adminAuthStorage.getToken()) {
      setCurrentAdmin(null);
      window.history.pushState(null, '', '/admin/login');
      return;
    }
    const admin = await checkCurrentAdminSession();
    if (admin) {
      setCurrentAdmin(admin);
      window.history.pushState(null, '', '/admin/dashboard');
    } else {
      setCurrentAdmin(null);
      window.history.pushState(null, '', '/admin/login');
    }
  };

  // Navigate back to Student Portal
  const navigateToStudent = () => {
    setIsAdminRoute(false);
    if (currentUserRef.current) {
      window.history.pushState(null, '', '/predictor');
    } else {
      window.history.pushState(null, '', '/login');
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = async () => {
    await logoutAdmin();
    setCurrentAdmin(null);
    window.history.replaceState(null, '', '/admin/login');
  };

  // Handle successful login
  const handleAuthenticated = async (user: AuthenticatedUser) => {
    setCurrentUser(user);

    const initialInput: StudentInput = {
      rank: user.rank,
      category: normalizeCategory(user.category),
      gender: normalizeGender(user.gender),
      preferredBranch: 'ALL',
      preferredCollege: 'ALL',
    };
    setStudentInput(initialInput);

    // Load logged-in student's counselling list from backend database
    const savedPrefs = await fetchStudentCounselling();
    setCounsellingList(savedPrefs);

    // Run prediction
    handlePredict(initialInput);

    // Update URL to /predictor as per Requirement 6 & 9
    window.history.pushState(null, '', '/predictor');
    setActiveTab('predictor');
  };

  // Handle Logout (Section 10)
  const handleLogout = async () => {
    await logoutStudent();
    setCurrentUser(null);
    setCounsellingList([]);
    setHasPredicted(false);
    setResults([]);
    setIsAccountModalOpen(false);

    // Redirect to login as per Requirement 10
    window.history.replaceState(null, '', '/login');
  };

  // Sync and save preferences to backend database
  const updateCounsellingList = useCallback(
    (newList: CounsellingPreference[]) => {
      setCounsellingList(newList);
      if (currentUser) {
        saveStudentCounselling(newList);
      }
    },
    [currentUser]
  );

  // Toggle Counselling List
  const handleToggleCounselling = (item: PredictionResult) => {
    const exists = counsellingIds.has(item.record.id);

    if (exists) {
      const updated = counsellingList.filter((p) => p.id !== item.record.id);
      updateCounsellingList(updated);
    } else {
      const newPref: CounsellingPreference = {
        id: item.record.id,
        record: item.record,
        closingRank: item.closingRank,
        studentRank: item.studentRank,
        chance: item.chance,
        priority: counsellingList.length + 1,
        addedAt: new Date().toISOString(),
      };
      const updated = [...counsellingList, newPref];
      updateCounsellingList(updated);
    }
  };

  // Move up in counselling list
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const copy = [...counsellingList];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    const updated = copy.map((item, idx) => ({ ...item, priority: idx + 1 }));
    updateCounsellingList(updated);
  };

  // Move down in counselling list
  const handleMoveDown = (index: number) => {
    if (index >= counsellingList.length - 1) return;
    const copy = [...counsellingList];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    const updated = copy.map((item, idx) => ({ ...item, priority: idx + 1 }));
    updateCounsellingList(updated);
  };

  // Remove from counselling list
  const handleRemovePreference = (id: string) => {
    const updated = counsellingList
      .filter((p) => p.id !== id)
      .map((item, idx) => ({ ...item, priority: idx + 1 }));
    updateCounsellingList(updated);
  };

  // Clear all
  const handleClearAll = () => {
    updateCounsellingList([]);
  };

  // Switch tab with URL update
  const handleTabChange = (tab: 'predictor' | 'counselling') => {
    setActiveTab(tab);
    window.history.pushState(null, '', `/${tab}`);
  };

  // Loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-100 animate-pulse">
            {isAdminRoute ? <ShieldCheck className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
          </div>
          <p className="text-xs font-bold text-slate-700 tracking-wide">
            {isAdminRoute ? 'Verifying Administrator Credentials...' : 'Verifying Student Session...'}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ADMIN PORTAL ROUTING (STRICTLY ISOLATED FROM NORMAL STUDENTS)
  // =========================================================================
  if (isAdminRoute) {
    if (currentAdmin) {
      return (
        <AdminDashboard
          admin={currentAdmin}
          onAdminLogout={handleAdminLogout}
          onNavigateToStudentPortal={navigateToStudent}
        />
      );
    }

    return (
      <AdminLoginPage
        onAdminAuthenticated={(admin) => {
          setCurrentAdmin(admin);
          window.history.pushState(null, '', '/admin/dashboard');
        }}
        onNavigateToStudentPortal={navigateToStudent}
      />
    );
  }

  // =========================================================================
  // 1. MANDATORY STUDENT AUTHENTICATION WALL
  // If student is not authenticated, ONLY render AuthPage (Login / Register).
  // Predictor, Counselling, and Account are completely inaccessible.
  // =========================================================================
  if (!currentUser) {
    const isRegister = window.location.pathname === '/register';
    return (
      <AuthPage
        initialTab={isRegister ? 'register' : 'login'}
        onAuthenticated={handleAuthenticated}
        onNavigateToAdmin={navigateToAdmin}
      />
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED APPLICATION
  // Rendered ONLY after student enters registered mobile + correct password.
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar with Profile badge & Logout button */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        counsellingCount={counsellingList.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: COLLEGE PREDICTOR */}
        {activeTab === 'predictor' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Student Verified Welcome Strip */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Welcome, {currentUser.fullName}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Authenticated</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Hall Ticket: <span className="font-semibold text-slate-700">{currentUser.hallTicket}</span> | Rank: <span className="font-semibold text-indigo-700">#{currentUser.rank.toLocaleString()}</span> | Category: <span className="font-semibold text-slate-700">{currentUser.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-view-account"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                >
                  View Account
                </button>
                <button
                  type="button"
                  id="btn-quick-counselling"
                  onClick={() => handleTabChange('counselling')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer shadow-xs"
                >
                  My Web Options ({counsellingList.length})
                </button>
              </div>
            </div>

            {/* Predictor Form */}
            <PredictorForm initialValues={studentInput} onPredict={handlePredict} />

            {/* Prediction Results Table & Cards */}
            {hasPredicted && (
              <ResultsTable
                results={results}
                studentInput={studentInput}
                onSelectCollege={(item) => setSelectedCollegeForModal(item)}
                onToggleCounselling={handleToggleCounselling}
                counsellingIds={counsellingIds}
                debugStats={debugStats}
                normalizedBranch={normalizeBranchCode(studentInput.preferredBranch)}
                onOpenValidationReport={() => setIsValidationModalOpen(true)}
              />
            )}

            {!hasPredicted && (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Ready to Predict Your Colleges
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click &ldquo;Predict Colleges&rdquo; above to analyze admissions across verified engineering cutoffs.
                </p>
              </div>
            )}

            <DisclaimerBox />
          </div>
        )}

        {/* TAB 2: MY COUNSELLING LIST */}
        {activeTab === 'counselling' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <CounsellingList
              preferences={counsellingList}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onRemove={handleRemovePreference}
              onClearAll={handleClearAll}
              onNavigateToPredictor={() => handleTabChange('predictor')}
            />

            <DisclaimerBox />
          </div>
        )}
      </main>

      {/* College Details Modal */}
      <CollegeModal
        item={selectedCollegeForModal}
        onClose={() => setSelectedCollegeForModal(null)}
        onToggleCounselling={handleToggleCounselling}
        isInCounselling={
          selectedCollegeForModal ? counsellingIds.has(selectedCollegeForModal.record.id) : false
        }
      />

      {/* Cutoff Data Validation Audit Modal */}
      <ValidationReportModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
      />

      {/* Student Account Details Modal */}
      <StudentAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        counsellingCount={counsellingList.length}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800">
                TG EAPCET / EAMCET Engineering College Predictor
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <button
                onClick={() => handleTabChange('predictor')}
                className="hover:text-indigo-600 font-medium cursor-pointer"
              >
                Predictor
              </button>
              <button
                onClick={() => handleTabChange('counselling')}
                className="hover:text-indigo-600 font-medium cursor-pointer"
              >
                My Counselling List
              </button>
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="hover:text-indigo-600 font-medium cursor-pointer"
              >
                My Account
              </button>
              <button
                onClick={() => setIsValidationModalOpen(true)}
                className="hover:text-indigo-600 font-medium cursor-pointer"
              >
                Audit Report
              </button>
              <button
                onClick={navigateToAdmin}
                className="hover:text-indigo-600 font-medium text-slate-400 cursor-pointer"
                title="Administrator Console"
              >
                Admin
              </button>
            </div>
          </div>

          <p className="leading-relaxed border-t border-slate-100 pt-4 text-slate-400 text-[11px]">
            Disclaimer: These predictions are based on previous-year EAMCET/TG EAPCET overall
            closing-rank data and are intended for guidance only. Actual cutoffs and seat allotments may
            change every year depending on competition, seat availability, reservation rules, candidate
            preferences, and counselling policies. No admission is guaranteed. Adding a college to My
            Counselling List does not submit your preferences to the official counselling authority.
          </p>
        </div>
      </footer>
    </div>
  );
}
