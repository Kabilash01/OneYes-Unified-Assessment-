import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, User, FileText, Megaphone, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const GlobalSearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({
    users: [],
    assessments: [],
    announcements: [],
    activityLogs: []
  });
  const [suggestions, setSuggestions] = useState([]);
  const [totalResults, setTotalResults] = useState(0);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut handler (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery) => {
    if (searchQuery.trim().length < 2) {
      setResults({ users: [], assessments: [], announcements: [], activityLogs: [] });
      setTotalResults(0);
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Perform parallel requests for search results and suggestions
      const [searchResponse, suggestionsResponse] = await Promise.all([
        api.get('/search', { params: { query: searchQuery, type: 'all', limit: 5 } }),
        api.get('/search/suggestions', { params: { query: searchQuery } })
      ]);

      if (searchResponse.data.success) {
        setResults(searchResponse.data.data.results);
        setTotalResults(searchResponse.data.data.totalResults);
      }

      if (suggestionsResponse.data.success) {
        setSuggestions(suggestionsResponse.data.data.suggestions);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 300); // 300ms debounce
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults({ users: [], assessments: [], announcements: [], activityLogs: [] });
    setTotalResults(0);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;

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

  // Navigate to result
  const handleResultClick = (type, id) => {
    setIsOpen(false);
    setQuery('');

    switch (type) {
      case 'user':
        navigate(`/admin-dashboard/users`); // Could add ?userId=${id} for filtering
        break;
      case 'assessment':
        navigate(`/admin-dashboard/assessments`); // Could add ?assessmentId=${id}
        break;
      case 'announcement':
        navigate(`/admin-dashboard/announcements`);
        break;
      case 'log':
        navigate(`/admin-dashboard/activity-logs`);
        break;
      default:
        break;
    }
  };

  // View all results
  const handleViewAllResults = () => {
    if (query.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  // Get icon for result type
  const getResultIcon = (type) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'assessment':
        return <FileText className="w-4 h-4" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4" />;
      case 'log':
        return <Activity className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search... (⌘K or Ctrl+K)"
          className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          )}

          {query && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
              Searching...
            </div>
          ) : totalResults === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No results found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <>
              {/* Users */}
              {results.users.length > 0 && (
                <div className="border-b border-gray-100">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Users ({results.users.length})
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleResultClick('user', user._id)}
                      className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left flex items-center gap-3 group"
                    >
                      <div className="flex-shrink-0 text-blue-600 group-hover:text-blue-700">
                        {getResultIcon('user')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {highlightMatch(user.name, query)}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {highlightMatch(user.email, query)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 capitalize">
                        {user.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Assessments */}
              {results.assessments.length > 0 && (
                <div className="border-b border-gray-100">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Assessments ({results.assessments.length})
                  </div>
                  {results.assessments.map((assessment) => (
                    <button
                      key={assessment._id}
                      onClick={() => handleResultClick('assessment', assessment._id)}
                      className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left flex items-center gap-3 group"
                    >
                      <div className="flex-shrink-0 text-green-600 group-hover:text-green-700">
                        {getResultIcon('assessment')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {highlightMatch(assessment.title, query)}
                        </div>
                        {assessment.description && (
                          <div className="text-sm text-gray-500 truncate">
                            {highlightMatch(assessment.description.substring(0, 100), query)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {assessment.subject}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Announcements */}
              {results.announcements.length > 0 && (
                <div className="border-b border-gray-100">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Announcements ({results.announcements.length})
                  </div>
                  {results.announcements.map((announcement) => (
                    <button
                      key={announcement._id}
                      onClick={() => handleResultClick('announcement', announcement._id)}
                      className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left flex items-center gap-3 group"
                    >
                      <div className="flex-shrink-0 text-purple-600 group-hover:text-purple-700">
                        {getResultIcon('announcement')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {highlightMatch(announcement.title, query)}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {highlightMatch(announcement.message.substring(0, 100), query)}
                        </div>
                      </div>
                      {announcement.isPinned && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Pinned
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Activity Logs (Admin only) */}
              {results.activityLogs.length > 0 && (
                <div className="border-b border-gray-100">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Activity Logs ({results.activityLogs.length})
                  </div>
                  {results.activityLogs.map((log) => (
                    <button
                      key={log._id}
                      onClick={() => handleResultClick('log', log._id)}
                      className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left flex items-center gap-3 group"
                    >
                      <div className="flex-shrink-0 text-orange-600 group-hover:text-orange-700">
                        {getResultIcon('log')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {highlightMatch(log.action, query)}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {log.userId?.name} - {log.ipAddress}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* View All Results Button */}
              {totalResults > 0 && (
                <button
                  onClick={handleViewAllResults}
                  className="w-full px-4 py-3 text-center text-blue-600 hover:bg-blue-50 transition-colors font-medium text-sm"
                >
                  View all {totalResults} results →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;
