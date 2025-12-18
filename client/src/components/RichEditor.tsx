'use client';

import dynamic from 'next/dynamic';

import 'react-quill-new/dist/quill.snow.css'; 


const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link'],
    ['clean']
  ],
};

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  return (
    <div className="bg-white">
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
        placeholder={placeholder}
        className="h-32 mb-12"
      />
    </div>
  );
}