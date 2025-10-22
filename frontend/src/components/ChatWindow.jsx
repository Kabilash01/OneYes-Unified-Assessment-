import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { Loader2, AlertCircle, RefreshCw, Users } from 'lucide-react';

/**
 * ChatWindow Component
 * Main chat interface with message list, input, and real-time features
 * 
 * Props:
 * - ticketId: ID of the support ticket
 * - ticket: Full ticket object
 * - currentUser: Logged in user object
 * - onTicketUpdate: Callback when ticket is updated
 */
const ChatWindow = ({ ticketId, ticket, currentUser, onTicketUpdate }) => {
  const {
    messages,
    unreadCount,
    typingUsers,
    activeUsers,
    loading,
    error,
    connected,
    joined,
    hasMore,
    messagesEndRef,
    actions,
    socketActions
  } = useChat(ticketId, {
    autoConnect: true,
    autoJoin: true,
    messageLimit: 50
  });

  const chatContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  /**
   * Handle scroll to check if user is at bottom
   */
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isAtBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    setShowScrollButton(!isAtBottom);

    // Load more when scrolled to top
    if (container.scrollTop === 0 && hasMore && !loading) {
      actions.loadMore();
    }
  };

  /**
   * Scroll to bottom button handler
   */
  const handleScrollToBottom = () => {
    actions.scrollToBottom();
    setShowScrollButton(false);
  };

  /**
   * Mark messages as read when visible
   */
  useEffect(() => {
    if (messages.length > 0 && joined) {
      // Mark all unread messages as read after a delay
      const timer = setTimeout(() => {
        actions.markAllAsRead();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [messages.length, joined, actions]);

  /**
   * Auto-scroll to bottom on new messages (if already at bottom)
   */
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isAtBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (isAtBottom) {
      actions.scrollToBottom();
    }
  }, [messages, actions]);

  // Loading state
  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Failed to load chat</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={actions.refresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {ticket?.title || `Ticket #${ticket?.ticketNumber}`}
            </h2>
            <p className="text-sm text-gray-600">
              {ticket?.subject} • {ticket?.priority}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Active users count */}
            {activeUsers.size > 1 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{activeUsers.size} online</span>
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={actions.refresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Refresh messages"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Unread count */}
        {unreadCount > 0 && (
          <div className="mt-2 text-sm text-indigo-600">
            {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
          </div>
        )}
      </div>

      {/* Messages List */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50"
      >
        {/* Load more indicator */}
        {hasMore && (
          <div className="text-center py-2">
            {loading ? (
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin mx-auto" />
            ) : (
              <button
                onClick={actions.loadMore}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Load older messages
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const showAvatar = !prevMessage || prevMessage.sender._id !== message.sender._id;
          const showTimestamp = !prevMessage || 
            new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 300000; // 5 min

          return (
            <MessageBubble
              key={message._id}
              message={message}
              currentUser={currentUser}
              showAvatar={showAvatar}
              showTimestamp={showTimestamp}
              onEdit={actions.editMessage}
              onDelete={actions.deleteMessage}
            />
          );
        })}

        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <TypingIndicator typingUsers={Array.from(typingUsers.values())} />
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={handleScrollToBottom}
          className="absolute bottom-24 right-8 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition z-10"
          title="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white">
        <MessageInput
          ticketId={ticketId}
          onSendMessage={actions.sendMessage}
          onStartTyping={actions.startTyping}
          onStopTyping={actions.stopTyping}
          disabled={!connected || !joined || ticket?.status === 'closed'}
        />
      </div>

      {/* Ticket closed message */}
      {ticket?.status === 'closed' && (
        <div className="px-6 py-3 bg-gray-100 border-t border-gray-200 text-center text-sm text-gray-600">
          This ticket is closed. Reopen it to continue the conversation.
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
