import React from 'react';
import { 
  X, 
  FileText, 
  FileImage, 
  File as FileIcon,
  FileArchive
} from 'lucide-react';

/**
 * FilePreview Component
 * Preview selected file before sending
 * 
 * Props:
 * - file: File object
 * - onRemove: Callback to remove file
 */
const FilePreview = ({ file, onRemove }) => {
  if (!file) return null;

  /**
   * Get file icon based on type
   */
  const getFileIcon = () => {
    const type = file.type;

    if (type.startsWith('image/')) {
      return <FileImage className="w-8 h-8 text-blue-600" />;
    } else if (type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-600" />;
    } else if (type.includes('word') || type === 'text/plain') {
      return <FileText className="w-8 h-8 text-indigo-600" />;
    } else if (type.includes('zip')) {
      return <FileArchive className="w-8 h-8 text-yellow-600" />;
    } else {
      return <FileIcon className="w-8 h-8 text-gray-600" />;
    }
  };

  /**
   * Get file thumbnail for images
   */
  const getThumbnail = () => {
    if (!file.type.startsWith('image/')) return null;

    const url = URL.createObjectURL(file);
    return (
      <img
        src={url}
        alt={file.name}
        className="w-16 h-16 object-cover rounded-lg"
        onLoad={() => URL.revokeObjectURL(url)}
      />
    );
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-100 border border-gray-300 rounded-lg">
      {/* Thumbnail or icon */}
      <div className="flex-shrink-0">
        {getThumbnail() || getFileIcon()}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{formatFileSize(file.size)}</span>
          <span>•</span>
          <span className="capitalize">{file.type.split('/')[1] || 'Unknown'}</span>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1.5 text-gray-600 hover:bg-gray-200 rounded-lg transition"
        title="Remove file"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default FilePreview;
