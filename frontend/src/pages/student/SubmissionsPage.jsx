import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, TrendingUp, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { submissionService } from '../../services/submissionService';
import SubmissionCard from '../../components/submissions/SubmissionCard';

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [submissions, searchTerm, statusFilter, sortBy]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await submissionService.getSubmissions();
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...submissions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.assessmentId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.assessmentId?.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.submittedAt || b.startedAt) - new Date(a.submittedAt || a.startedAt);
        case 'oldest':
          return new Date(a.submittedAt || a.startedAt) - new Date(b.submittedAt || b.startedAt);
        case 'score-high':
          return (b.score || 0) - (a.score || 0);
        case 'score-low':
          return (a.score || 0) - (b.score || 0);
        default:
          return 0;
      }
    });

    setFilteredSubmissions(filtered);
  };

  const getStats = () => {
    const stats = {
      total: submissions.length,
      evaluated: submissions.filter(s => s.status === 'evaluated').length,
      pending: submissions.filter(s => s.status === 'submitted').length,
      inProgress: submissions.filter(s => s.status === 'in-progress').length,
      averageScore: 0
    };

    const evaluatedSubs = submissions.filter(s => s.status === 'evaluated');
    if (evaluatedSubs.length > 0) {
      const totalScore = evaluatedSubs.reduce((sum, sub) => sum + (sub.score || 0), 0);
      const totalMarks = evaluatedSubs.reduce((sum, sub) => sum + (sub.assessmentId?.totalMarks || 0), 0);
      stats.averageScore = totalMarks > 0 ? ((totalScore / totalMarks) * 100).toFixed(1) : 0;
    }

    return stats;
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and track your assessment submissions and results
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Evaluated</p>
                <p className="mt-2 text-3xl font-bold text-green-600">{stats.evaluated}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <Filter className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">{stats.averageScore}%</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Filters */}
            <div className="hidden gap-4 lg:flex">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="evaluated">Evaluated</option>
                <option value="submitted">Pending Evaluation</option>
                <option value="in-progress">In Progress</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="score-high">Highest Score</option>
                <option value="score-low">Lowest Score</option>
              </select>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="evaluated">Evaluated</option>
                <option value="submitted">Pending Evaluation</option>
                <option value="in-progress">In Progress</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="score-high">Highest Score</option>
                <option value="score-low">Lowest Score</option>
              </select>
            </div>
          )}
        </div>

        {/* Submissions Grid */}
        {filteredSubmissions.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">No submissions found</p>
            <p className="text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'You haven\'t submitted any assessments yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubmissions.map((submission) => (
              <SubmissionCard key={submission._id} submission={submission} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsPage;
