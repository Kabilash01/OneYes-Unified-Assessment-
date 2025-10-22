import React, { useState, useRef } from 'react';
import { Upload, Download, X, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const BulkUserImport = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,email,password,role,department,phoneNumber
John Doe,john.doe@example.com,SecurePassword123,student,Computer Science,+1234567890
Jane Smith,jane.smith@example.com,SecurePassword456,instructor,Mathematics,+9876543210
Bob Johnson,bob.johnson@example.com,SecurePassword789,student,Physics,+1122334455`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk_users_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded successfully');
  };

  const validateAndUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    setValidationResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/users/bulk-import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setValidationResult(response.data);

      if (response.data.success) {
        toast.success(
          `Successfully imported ${response.data.successCount} users!` +
          (response.data.failedCount > 0 ? ` (${response.data.failedCount} failed)` : '')
        );
        
        if (response.data.failedCount === 0) {
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 2000);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error uploading file';
      toast.error(errorMessage);
      setValidationResult({
        success: false,
        message: errorMessage,
        errors: error.response?.data?.errors || []
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationResult(null);
    setUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bulk User Import
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Upload CSV file to create multiple users at once
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              📋 CSV Format Requirements
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Required columns: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">name</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">email</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">password</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">role</code></li>
              <li>Optional columns: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">department</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">phoneNumber</code></li>
              <li>Valid roles: student, instructor, admin</li>
              <li>Email must be unique and valid</li>
              <li>Password must be at least 6 characters</li>
            </ul>
          </div>

          {/* Download Template Button */}
          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download CSV Template
          </button>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            
            {file ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Selected file: {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => setFile(null)}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Drag and drop your CSV file here, or
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Browse Files
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Maximum file size: 5MB
                </p>
              </div>
            )}
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className={`rounded-lg p-4 ${
              validationResult.success
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {validationResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    validationResult.success
                      ? 'text-green-900 dark:text-green-200'
                      : 'text-red-900 dark:text-red-200'
                  }`}>
                    {validationResult.message}
                  </h4>
                  
                  {validationResult.successCount > 0 && (
                    <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                      ✓ {validationResult.successCount} users created successfully
                    </p>
                  )}
                  
                  {validationResult.failedCount > 0 && (
                    <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                      ✗ {validationResult.failedCount} users failed
                    </p>
                  )}

                  {validationResult.errors && validationResult.errors.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                      {validationResult.errors.map((error, index) => (
                        <div key={index} className="text-sm bg-white dark:bg-gray-800 rounded p-2 border border-red-200 dark:border-red-800">
                          <p className="font-medium text-red-900 dark:text-red-200">
                            Row {error.row}: {error.email || 'Unknown'}
                          </p>
                          <p className="text-red-700 dark:text-red-300">{error.error}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={validateAndUpload}
            disabled={!file || uploading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Users
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUserImport;
