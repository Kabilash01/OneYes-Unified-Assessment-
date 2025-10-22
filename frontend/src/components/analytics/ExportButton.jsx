import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Mail, X } from 'lucide-react';
import { useReportGeneration } from '../../hooks/useAnalytics';
import { toast } from 'react-toastify';

const ExportButton = ({ reportType, filters = {}, studentId, instructorId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const { generateReport, emailReport, generating, emailing } = useReportGeneration();

  const handleDownload = async (format) => {
    try {
      const config = {
        reportType,
        format,
        filters: {
          ...filters,
          studentId,
          instructorId,
        },
      };

      await generateReport(config);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleEmail = async () => {
    try {
      const config = {
        reportType,
        format: selectedFormat,
        filters: {
          ...filters,
          studentId,
          instructorId,
        },
      };

      await emailReport(config);
      setShowEmailDialog(false);
      setIsOpen(false);
      toast.success('Report sent to your email!');
    } catch (error) {
      console.error('Email failed:', error);
      toast.error('Failed to send report');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={generating || emailing}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <Download className="w-4 h-4" />
        <span>{generating || emailing ? 'Processing...' : 'Export'}</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Export Format
              </div>
              
              <button
                onClick={() => handleDownload('pdf')}
                disabled={generating}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4 text-red-500" />
                <div className="flex-1 text-left">
                  <div className="font-medium">PDF Document</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Professional report format
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleDownload('excel')}
                disabled={generating}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-500" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Excel Spreadsheet</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Multi-sheet workbook
                  </div>
                </div>
              </button>

              <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

              <button
                onClick={() => {
                  setShowEmailDialog(true);
                  setIsOpen(false);
                }}
                disabled={emailing}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Mail className="w-4 h-4 text-indigo-500" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Email Report</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Send to your email
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Email Dialog */}
      {showEmailDialog && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Email Report
                  </h3>
                  <button
                    onClick={() => setShowEmailDialog(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select the format for your report. It will be sent to your registered email address.
                </p>

                <div className="space-y-2 mb-6">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={selectedFormat === 'pdf'}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <FileText className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">PDF Document</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Professional report format
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      name="format"
                      value="excel"
                      checked={selectedFormat === 'excel'}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <FileSpreadsheet className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">Excel Spreadsheet</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Multi-sheet workbook
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowEmailDialog(false)}
                    disabled={emailing}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEmail}
                    disabled={emailing}
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{emailing ? 'Sending...' : 'Send Email'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
