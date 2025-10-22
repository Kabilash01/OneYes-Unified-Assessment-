import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { 
  Edit2, 
  Trash2, 
  Check, 
  CheckCheck, 
  File, 
  Download,
  X,
  Save
} from 'lucide-react';

/**
 * MessageBubble Component
 * Individual message display with markdown, attachments, and actions
 * 
 * Props:
 * - message: Message object
 * - currentUser: Logged in user
 * - showAvatar: Whether to show user avatar
 * - showTimestamp: Whether to show message timestamp
 * - onEdit: Edit message callback
 * - onDelete: Delete message callback
 */
const MessageBubble = ({ 
  message, 
  currentUser, 
  showAvatar = true,
  showTimestamp = true,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.message);
  const [showActions, setShowActions] = useState(false);

  const isOwnMessage = message.sender._id === currentUser._id;
  const isSystemMessage = message.messageType === 'system';

  /**
   * Check if message can be edited
   * Only text messages, within 5 minutes, by sender
   */
  const canEdit = () => {
    if (!isOwnMessage || isSystemMessage) return false;
    if (message.messageType !== 'text') return false;
    
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    return messageAge < 300000; // 5 minutes
  };

  /**
   * Check if message can be deleted
   * By sender or admin
   */
  const canDelete = () => {
    return isOwnMessage || currentUser.role === 'admin';
  };

  /**
   * Handle edit save
   */
  const handleSaveEdit = async () => {
    if (editedContent.trim() === message.message) {
      setIsEditing(false);
      return;
    }

    try {
      await onEdit(message._id, editedContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await onDelete(message._id);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  /**
   * Get avatar initials
   */
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Get read status icon
   */
  const getReadStatusIcon = () => {
    if (!isOwnMessage) return null;

    const readCount = message.readBy?.length || 0;
    
    if (readCount === 0) {
      return <Check className="w-4 h-4 text-gray-400" />;
    } else if (readCount === 1) {
      return <Check className="w-4 h-4 text-blue-500" />;
    } else {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    }
  };

  // System message styling
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-gray-200 rounded-full text-sm text-gray-700">
          {message.message}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex max-w-xl ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {showAvatar && (
          <div className={`flex-shrink-0 ${isOwnMessage ? 'ml-3' : 'mr-3'}`}>
            {message.sender.avatar ? (
              <img
                src={message.sender.avatar}
                alt={message.sender.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                ${isOwnMessage ? 'bg-indigo-600' : 'bg-gray-600'}`}
              >
                {getInitials(message.sender.name)}
              </div>
            )}
          </div>
        )}

        {!showAvatar && <div className="w-10 flex-shrink-0" />}

        {/* Message content */}
        <div className="flex-1">
          {/* Sender name and timestamp */}
          {showTimestamp && (
            <div className={`flex items-center mb-1 space-x-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <span className="text-sm font-medium text-gray-900">
                {isOwnMessage ? 'You' : message.sender.name}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
              {message.isEdited && (
                <span className="text-xs text-gray-400 italic">(edited)</span>
              )}
            </div>
          )}

          {/* Message bubble */}
          <div className={`relative rounded-2xl px-4 py-3 ${
            isOwnMessage 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-200 text-gray-900'
          } ${message.isDeleted ? 'opacity-60 italic' : ''}`}>
            {/* Edit mode */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedContent(message.message);
                    }}
                    className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                  >
                    <Save className="w-4 h-4 inline mr-1" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Message text with markdown */}
                {message.messageType === 'text' && !message.isDeleted && (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      className={isOwnMessage ? 'text-white [&>*]:text-white' : 'text-gray-900'}
                    >
                      {message.message}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Deleted message */}
                {message.isDeleted && (
                  <p className={isOwnMessage ? 'text-gray-200' : 'text-gray-600'}>
                    {message.message}
                  </p>
                )}

                {/* File attachment */}
                {message.messageType === 'file' && message.attachment && (
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isOwnMessage ? 'bg-indigo-700' : 'bg-gray-300'
                  }`}>
                    <File className="w-8 h-8" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{message.attachment.originalName}</p>
                      <p className={`text-sm ${isOwnMessage ? 'text-gray-200' : 'text-gray-600'}`}>
                        {(message.attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <a
                      href={message.attachment.url}
                      download={message.attachment.originalName}
                      className={`p-2 rounded-lg transition ${
                        isOwnMessage 
                          ? 'bg-indigo-800 hover:bg-indigo-900' 
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                )}
              </>
            )}

            {/* Read status */}
            <div className={`flex items-center justify-end mt-1 space-x-1 ${
              isOwnMessage ? 'text-gray-200' : 'text-gray-500'
            }`}>
              <span className="text-xs">
                {new Date(message.createdAt).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {getReadStatusIcon()}
            </div>
          </div>

          {/* Action buttons */}
          {showActions && !isEditing && !message.isDeleted && (
            <div className={`flex space-x-2 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              {canEdit() && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                  title="Edit message"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {canDelete() && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
