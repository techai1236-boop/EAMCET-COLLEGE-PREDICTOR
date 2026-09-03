import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  LogOut,
  ShieldCheck,
  BookmarkCheck,
  RefreshCw,
  GraduationCap,
} from 'lucide-react';
import {
  AdminStudentSummary,
  AuthenticatedAdmin,
  fetchAdminStudents,
  fetchAdminStudentDetails,
} from '../services/api';
import { AdminStudentDetailModal } from './AdminStudentDetailModal';

interface AdminDashboardProps {
  admin: AuthenticatedAdmin;
  onAdminLogout: () => void;
  onNavigateToStudentPortal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  admin,
  onAdminLogout,
  onNavigateToStudentPortal,
}) => {
  const [students, setStudents] = useState<AdminStudentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rank-asc' | 'rank-desc' | 'date-desc' | 'date-asc' | 'name-asc'>('rank-asc');

  // Selected student modal state
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentSummary | null>(null);
  const [studentCounsellingList, setStudentCounsellingList] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Load students from backend
  const loadStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load registered students.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Handle student click to view complete registration info & counselling list
  const handleViewStudentDetails = async (student: AdminStudentSummary) => {
    setSelectedStudent(student);
    setIsLoadingDetails(true);
    try {
      const res = await fetchAdminStudentDetails(student.id);
      setStudentCounsellingList(res.counsellingList || []);
    } catch (err) {
      console.error('Failed to load student details:', err);
      setStudentCounsellingList([]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    let list = [...students];

    // Search query: Name, Hall Ticket, or Mobile
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((s) => {
        const nameMatch = s.fullName.toLowerCase().includes(q);
        const htMatch = s.hallTicket.toLowerCase().includes(q);
        const mobileMatch = s.mobile.includes(q);
        return nameMatch || htMatch || mobileMatch;
      });
    }

    // Category Filter
    if (selectedCategory !== 'ALL') {
      list = list.filter((s) => s.category.toUpperCase() === selectedCategory.toUpperCase());
    }

    // Gender Filter
    if (selectedGender !== 'ALL') {
      list = list.filter((s) => s.gender.toUpperCase() === selectedGender.toUpperCase());
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'rank-asc') {
        return a.rank - b.rank;
      }
      if (sortBy === 'rank-desc') {
        return b.rank - a.rank;
      }
      if (sortBy === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'name-asc') {
        return a.fullName.localeCompare(b.fullName);
      }
      return 0;
    });

    return list;
  }, [students, searchQuery, selectedCategory, selectedGender, sortBy]);

  // Total saved counselling preferences across all students
  const totalOptionsSaved = useMemo(() => {
    return students.reduce((acc, s) => acc + (s.counsellingCount || 0), 0);
  }, [students]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                    TG EAPCET Admin
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                    Administrator Dashboard
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Verified Student Registry & Counselling Analytics
                </p>
              </div>
            </div>

            {/* Admin Profile & Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Admin: <strong className="text-white">{admin.username}</strong></span>
              </div>

              {/* Link to view student predictor app */}
              <button
                type="button"
                id="btn-admin-student-portal"
                onClick={onNavigateToStudentPortal}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                title="View College Predictor Student Screen"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Student View</span>
              </button>

              {/* Admin Logout Button */}
              <button
                type="button"
                id="btn-admin-logout"
                onClick={onAdminLogout}
                className="px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 text-xs font-bold text-rose-300 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Logout from Admin Dashboard"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Registered Students */}
          <div
            id="metric-total-students"
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Registered Students
              </div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {students.length.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                100% Verified in Database
              </div>
            </div>
          </div>

          {/* Card 2: Total Saved Web Options */}
          <div
            id="metric-saved-options"
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Saved Web Options
              </div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {totalOptionsSaved.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Active Counselling Preferences
              </div>
            </div>
          </div>

          {/* Card 3: Security & Privacy Status */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password Security
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">
                Zero-Knowledge Hashes
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Student passwords hidden from admin
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input: Name, Hall Ticket, or Mobile */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="admin-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name, hall ticket number, or mobile..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              id="btn-admin-refresh"
              onClick={loadStudents}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Reload student registry from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Filter and Sort Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
            {/* Category Filter */}
            <div>
              <label htmlFor="filter-category" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Filter by Category
              </label>
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="OC">OC (Open Competition)</option>
                <option value="BC_A">BC-A</option>
                <option value="BC_B">BC-B</option>
                <option value="BC_C">BC-C</option>
                <option value="BC_D">BC-D</option>
                <option value="BC_E">BC-E</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label htmlFor="filter-gender" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Filter by Gender
              </label>
              <select
                id="filter-gender"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Genders</option>
                <option value="BOYS">General / Boys</option>
                <option value="GIRLS">Girls Quota</option>
              </select>
            </div>

            {/* Sort by Rank / Date */}
            <div>
              <label htmlFor="sort-by-select" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sort Students By
              </label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="rank-asc">Rank: Lowest to Highest (Top Ranks First)</option>
                <option value="rank-desc">Rank: Highest to Lowest</option>
                <option value="date-desc">Registered Date: Newest First</option>
                <option value="date-asc">Registered Date: Oldest First</option>
                <option value="name-asc">Student Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Status summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Showing <strong className="text-slate-800">{filteredStudents.length}</strong> of{' '}
              <strong className="text-slate-800">{students.length}</strong> registered students
            </span>
            {(searchQuery || selectedCategory !== 'ALL' || selectedGender !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedGender('ALL');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Registered Students Directory</span>
            </h2>
            <span className="text-xs text-slate-500">
              Click any student row to inspect complete registration details & counselling options
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-3">
              <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
              <p>Loading registered student accounts from database...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-xs text-rose-600 space-y-2">
              <p>{error}</p>
              <button
                onClick={loadStudents}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">No student accounts matched your filter</p>
              <p className="text-[11px] text-slate-400">Try adjusting your search query or category filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table id="table-admin-students" className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Hall Ticket Number</th>
                    <th className="py-3 px-4 text-right">EAMCET Rank</th>
                    <th className="py-3 px-4 text-center">Category</th>
                    <th className="py-3 px-4 text-center">Gender</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      onClick={() => handleViewStudentDetails(student)}
                      className="hover:bg-indigo-50/40 transition cursor-pointer group"
                    >
                      {/* Student Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="group-hover:text-indigo-600 transition-colors font-bold">
                            {student.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            ID: {student.id.slice(0, 12)}...
                          </div>
                        </div>
                      </td>

                      {/* Hall Ticket Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-900">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-xs">
                          {student.hallTicket}
                        </span>
                      </td>

                      {/* EAMCET Rank */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                        #{student.rank.toLocaleString()}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {student.category}
                        </span>
                      </td>

                      {/* Gender */}
                      <td className="py-3.5 px-4 text-center font-semibold text-[11px] text-slate-600">
                        {student.gender === 'GIRLS' ? (
                          <span className="text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                            Girls
                          </span>
                        ) : (
                          <span className="text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                            Boys / Gen
                          </span>
                        )}
                      </td>

                      {/* Mobile Number */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {student.mobile}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDate(student.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewStudentDetails(student);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition shadow-2xs flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <span>View Details</span>
                          {student.counsellingCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-indigo-800 text-indigo-100 rounded-full text-[9px] font-bold">
                              {student.counsellingCount}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Complete Student Registration Information & Counselling List Modal */}
      <AdminStudentDetailModal
        student={selectedStudent}
        counsellingList={studentCounsellingList}
        isLoading={isLoadingDetails}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
};
