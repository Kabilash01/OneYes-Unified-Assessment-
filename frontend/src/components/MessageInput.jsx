import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  X,
  File,
  Image as ImageIcon
} from 'lucide-react';
import FilePreview from './FilePreview';

/**
 * MessageInput Component
 * Text input with emoji picker, file upload, and typing indicators
 * 
 * Props:
 * - ticketId: Support ticket ID
 * - onSendMessage: Callback to send message
 * - onStartTyping: Callback when user starts typing
 * - onStopTyping: Callback when user stops typing
 * - disabled: Disable input
 */
const MessageInput = ({ 
  ticketId, 
  onSendMessage, 
  onStartTyping, 
  onStopTyping,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip'
  ];

  /**
   * Handle message change and typing indicators
   */
  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }

    // Typing indicator logic
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onStartTyping?.();
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping?.();
    }, 1000);
  };

  /**
   * Handle emoji selection
   */
  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    
    const newMessage = 
      message.substring(0, cursorPosition) + 
      emoji + 
      message.substring(cursorPosition);
    
    setMessage(newMessage);
    setShowEmojiPicker(false);

    // Focus back on textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        cursorPosition + emoji.length, 
        cursorPosition + emoji.length
      );
    }, 0);
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert('Invalid file type. Allowed: Images, PDF, Word, Text, ZIP');
      return;
    }

    setAttachment(file);
    e.target.value = ''; // Reset input
  };

  /**
   * Remove attachment
   */
  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  /**
   * Send message
   */
  const handleSendMessage = async () => {
    if ((!message.trim() && !attachment) || isSending || disabled) return;

    try {
      setIsSending(true);

      const messageType = attachment ? 'file' : 'text';
      await onSendMessage(message.trim() || 'File attachment', attachment, messageType);

      // Clear inputs
      setMessage('');
      setAttachment(null);
      setIsTyping(false);
      onStopTyping?.();

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle Enter key to send
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Click outside to close emoji picker
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  /**
   * Cleanup typing timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative px-6 py-4">
      {/* Attachment preview */}
      {attachment && (
        <div className="mb-3">
          <FilePreview
            file={attachment}
            onRemove={handleRemoveAttachment}
          />
        </div>
      )}

      {/* Input container */}
      <div className="flex items-end space-x-3">
        {/* File upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending}
          className="flex-shrink-0 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept={ALLOWED_FILE_TYPES.join(',')}
        />

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            placeholder={disabled ? 'Chat is disabled' : 'Type a message... (Shift+Enter for new line)'}
            className="w-full px-4 py-3 pr-12 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ maxHeight: '150px', minHeight: '48px' }}
          />

          {/* Emoji picker button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled || isSending}
            className="absolute right-3 top-3 p-1 text-gray-600 hover:bg-gray-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={350}
                height={400}
                theme="light"
                searchPlaceholder="Search emoji..."
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          disabled={(!message.trim() && !attachment) || disabled || isSending}
          className="flex-shrink-0 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
          title="Send message"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between mt-2 px-1 text-xs text-gray-500">
        <span>
          Markdown supported • Max 10MB • Enter to send, Shift+Enter for new line
        </span>
        {message.length > 0 && (
          <span className={message.length > 4900 ? 'text-red-600 font-medium' : ''}>
            {message.length} / 5000
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
