import { useState, useRef, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
}

export default function FileUpload({ 
  onFileSelect, 
  acceptedTypes = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css', '.json', '.md'],
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.some(type => extension === type)) {
      return `${file.name}: File type not supported`;
    }
    if (file.size > maxSize) {
      return `${file.name}: File size exceeds ${maxSize / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleFiles = (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    filesArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setFiles(validFiles);
      onFileSelect(validFiles);
    }
    
    setErrors(newErrors);
    setTimeout(() => setErrors([]), 5000);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFileSelect(newFiles);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      js: '📜', jsx: '⚛️', ts: '📘', tsx: '⚛️',
      py: '🐍', java: '☕', cpp: '⚙️', c: '⚙️',
      html: '🌐', css: '🎨', json: '📋', md: '📝'
    };
    return iconMap[extension || ''] || '📄';
  };

  return (
    <div className="relative">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          className="hidden"
        />

        <motion.div
          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          className="flex flex-col items-center"
        >
          <svg 
            className={`w-12 h-12 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {isDragging ? 'Drop files here' : 'Drag & drop files here or click to browse'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Supported: {acceptedTypes.join(', ')}
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 right-0 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            {errors.map((error, index) => (
              <p key={index} className="text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{getFileIcon(file.name)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}