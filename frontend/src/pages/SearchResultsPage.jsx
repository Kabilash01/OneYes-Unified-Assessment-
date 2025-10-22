import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  FileText, 
  Megaphone, 
  Activity, 
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({
    users: [],
    assessments: [],
    announcements: [],
    activityLogs: []
  });
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  // Perform search
  useEffect(() => {
    if (query.trim().length >= 2) {
      performSearch();
    }
  }, [query, selectedType, currentPage]);

  const performSearch = async () => {
    setIsLoading(true);

    try {
      const response = await api.get('/search', {
        params: {
          query,
          type: selectedType,
          limit
        }
      });

      if (response.data.success) {
        setResults(response.data.data.results);
        setTotalResults(response.data.data.totalResults);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query.trim() || !text) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-gray-900 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Filter buttons
  const filterButtons = [
    { value: 'all', label: 'All Results', icon: Search },
    { value: 'users', label: 'Users', icon: User },
    { value: 'assessments', label: 'Assessments', icon: FileText },
    { value: 'announcements', label: 'Announcements', icon: Megaphone },
    { value: 'logs', label: 'Activity Logs', icon: Activity }
  ];

  // Calculate result counts
  const resultCounts = {
    all: totalResults,
    users: results.users.length,
    assessments: results.assessments.length,
    announcements: results.announcements.length,
    logs: results.activityLogs.length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} found for "{query}"
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filterButtons.map((filter) => {
            const Icon = filter.icon;
            const count = resultCounts[filter.value];

            return (
              <button
                key={filter.value}
                onClick={() => {
                  setSelectedType(filter.value);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedType === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
                {count > 0 && (
                  <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                    selectedType === filter.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search query or filters
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Users Results */}
            {(selectedType === 'all' || selectedType === 'users') && results.users.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Users ({results.users.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {results.users.map((user) => (
                    <div
                      key={user._id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin-dashboard/users`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {highlightMatch(user.name, query)}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {highlightMatch(user.email, query)}
                          </p>
                          {user.instituteCode && (
                            <p className="text-sm text-gray-500 mt-1">
                              Institute Code: {highlightMatch(user.instituteCode, query)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'instructor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">
                            {user.isActive ? '✓ Active' : '✗ Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessments Results */}
            {(selectedType === 'all' || selectedType === 'assessments') && results.assessments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Assessments ({results.assessments.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {results.assessments.map((assessment) => (
                    <div
                      key={assessment._id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin-dashboard/assessments`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {highlightMatch(assessment.title, query)}
                          </h3>
                          {assessment.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {highlightMatch(assessment.description, query)}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Subject: {assessment.subject}</span>
                            <span>Duration: {assessment.duration} min</span>
                            <span>Total Marks: {assessment.totalMarks}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            assessment.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {assessment.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">
                            {format(new Date(assessment.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Announcements Results */}
            {(selectedType === 'all' || selectedType === 'announcements') && results.announcements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-purple-600" />
                    Announcements ({results.announcements.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {results.announcements.map((announcement) => (
                    <div
                      key={announcement._id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin-dashboard/announcements`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {highlightMatch(announcement.title, query)}
                            </h3>
                            {announcement.isPinned && (
                              <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                                Pinned
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {highlightMatch(announcement.message, query)}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="capitalize">
                              Priority: {announcement.priority}
                            </span>
                            <span className="capitalize">
                              Audience: {announcement.targetAudience}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            announcement.priority === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : announcement.priority === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : announcement.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {announcement.priority}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">
                            {format(new Date(announcement.publishDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Logs Results */}
            {(selectedType === 'all' || selectedType === 'logs') && results.activityLogs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-600" />
                    Activity Logs ({results.activityLogs.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {results.activityLogs.map((log) => (
                    <div
                      key={log._id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {highlightMatch(log.action, query)}
                          </h3>
                          {log.details && (
                            <p className="text-sm text-gray-600 mt-1">
                              {highlightMatch(log.details, query)}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {log.userId && (
                              <span>User: {log.userId.name}</span>
                            )}
                            <span>IP: {highlightMatch(log.ipAddress, query)}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-500">
                            {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
