import React from 'react';

/**
 * TypingIndicator Component
 * Animated indicator showing who is typing
 * 
 * Props:
 * - typingUsers: Array of user names who are typing
 */
const TypingIndicator = ({ typingUsers = [] }) => {
  if (typingUsers.length === 0) return null;

  const getText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing`;
    } else {
      return `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-gray-600 italic">
        {getText()}
      </span>
    </div>
  );
};

export default TypingIndicator;
