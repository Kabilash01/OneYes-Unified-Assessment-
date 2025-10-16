import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { usePagination, useDebounce } from '../../hooks/useCommon';
import { formatDate, formatDuration } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Spinner, Skeleton } from '../../components/common/Loader';

/**
 * AssessmentCatalog Component
 * @description Browse and filter available assessments with enhanced filters
 */
const AssessmentCatalog = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { currentPage, setCurrentPage, totalPages, setTotalPages } = usePagination();

  /**
   * Fetch instructors list
   */
  const fetchInstructors = async () => {
    try {
      const response = await studentAPI.getInstructors();
      setInstructors(response.data.instructors || []);
    } catch (error) {
      console.error('Failed to load instructors:', error);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  /**
   * Fetch assessments with filters
   */
  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 9,
        sort: sortBy,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedSubject && { subject: selectedSubject }),
        ...(selectedInstructor && { instructor: selectedInstructor }),
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      };

      const response = await studentAPI.getAssessments(params);
      setAssessments(response.data.assessments);
      setTotalPages(response.data.pagination?.pages || 1);
      
      // Extract unique subjects for filter
      const allSubjects = response.data.assessments
        .flatMap(a => a.subjects || [])
        .filter((v, i, a) => a.indexOf(v) === i);
      setSubjects(allSubjects);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [currentPage, debouncedSearch, selectedSubject, selectedInstructor, selectedType, sortBy, dateFrom, dateTo]);

  /**
   * Handle assessment start
   */
  const handleStartAssessment = (assessmentId) => {
    navigate(`/student/test/${assessmentId}`);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedInstructor('');
    setSelectedType('all');
    setSortBy('recent');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedSubject || selectedInstructor || 
                          selectedType !== 'all' || sortBy !== 'recent' || 
                          dateFrom || dateTo;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Available Assessments
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse and start available assessments
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/student/calendar')}
          >
            📅 Calendar View
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Row 1: Search */}
          <div>
            <Input
              type="text"
              placeholder="Search assessments by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              label="Search"
            />
          </div>

          {/* Row 2: Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Instructor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instructor
              </label>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Instructors</option>
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assessment Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assessment Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="mcq-only">MCQ Only</option>
                <option value="written">Written Only</option>
                <option value="mixed">Mixed (MCQ + Written)</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="recent">Newest First</option>
                <option value="alphabetical">Title A-Z</option>
                <option value="duration">Shortest First</option>
              </select>
            </div>
          </div>

          {/* Row 3: Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Filters applied
              </span>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : assessments.length === 0 ? (
        /* Empty State */
        <Card className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Assessments Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || selectedSubject
              ? 'Try adjusting your filters'
              : 'No assessments are currently available'}
          </p>
          {(searchTerm || selectedSubject) && (
            <Button onClick={clearFilters}>Clear Filters</Button>
          )}
        </Card>
      ) : (
        /* Assessment Grid */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {assessments.map((assessment) => (
              <AssessmentCard
                key={assessment._id}
                assessment={assessment}
                onStart={() => handleStartAssessment(assessment._id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * AssessmentCard Component
 * @description Individual assessment card
 */
const AssessmentCard = ({ assessment, onStart }) => {
  const isActive = new Date(assessment.startDate) <= new Date() && 
                   new Date() <= new Date(assessment.endDate);

  return (
    <Card hover className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
            {assessment.title}
          </h3>
          {assessment.status === 'published' && (
            <Badge variant={isActive ? 'success' : 'warning'}>
              {isActive ? 'Active' : 'Scheduled'}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {assessment.description || 'No description provided'}
        </p>
      </div>

      {/* Subjects */}
      {assessment.subjects && assessment.subjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {assessment.subjects.slice(0, 3).map((subject, index) => (
            <Badge key={index} variant="primary" size="sm">
              {subject}
            </Badge>
          ))}
          {assessment.subjects.length > 3 && (
            <Badge variant="gray" size="sm">
              +{assessment.subjects.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Details */}
      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Duration: {formatDuration(assessment.duration)}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Total Marks: {assessment.totalMarks}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Available: {formatDate(assessment.startDate)} - {formatDate(assessment.endDate)}
        </div>
        {assessment.createdBy?.name && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            By: {assessment.createdBy.name}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-auto">
        <Button
          variant="primary"
          className="w-full"
          onClick={onStart}
          disabled={!isActive}
        >
          {isActive ? 'Start Assessment' : 'Not Available Yet'}
        </Button>
      </div>
    </Card>
  );
};

export default AssessmentCatalog;
