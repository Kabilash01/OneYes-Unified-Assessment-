import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const LongAnswerQuestion = ({ question, answer, onAnswerChange }) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ]
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link'
  ];

  return (
    <div className="space-y-3">
      <ReactQuill
        theme="snow"
        value={answer || ''}
        onChange={onAnswerChange}
        modules={modules}
        formats={formats}
        placeholder="Type your detailed answer here..."
        className="bg-white"
        style={{ height: '300px', marginBottom: '50px' }}
      />
      
      <p className="text-sm text-gray-600 mt-16">
        Use the toolbar above to format your answer
      </p>
    </div>
  );
};

export default LongAnswerQuestion;
