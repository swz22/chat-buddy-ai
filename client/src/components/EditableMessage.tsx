import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { messageVariants } from '../utils/animations';
import { formatDistanceToNow, getRelativeTimeString } from '../utils/dateHelpers';

interface EditableMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  messageId?: number;
  socket?: any;
  onEdit?: (newContent: string) => void;
}

export default function EditableMessage({ 
  role, 
  content: initialContent, 
  timestamp = new Date(),
  messageId,
  socket,
  onEdit
}: EditableMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [editContent, setEditContent] = useState(initialContent);
  const [showFullTime, setShowFullTime] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUser = role === 'user';

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editContent.trim() === content.trim()) {
      setIsEditing(false);
      return;
    }

    if (socket && messageId) {
      socket.emit('message:edit', {
        messageId,
        newContent: editContent
      });

      socket.once('message:edited', (data: any) => {
        console.log('Message edited:', data);
        setContent(data.newContent);
        setIsEditing(false);
        onEdit?.(data.newContent);
      });

      socket.once('message:edit:error', (data: any) => {
        console.error('Edit failed:', data.error);
        alert(`Failed to edit: ${data.error}`);
      });
    } else {
      setContent(editContent);
      setIsEditing(false);
      onEdit?.(editContent);
    }
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };

  if (isEditing && isUser) {
    return (
      <motion.div
        className="flex gap-3 mb-6 flex-row-reverse"
        variants={messageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 max-w-3xl">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 resize-none"
              placeholder="Edit your message..."
            />
            
            <div className="flex items-center gap-2 mt-2 justify-end">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Ctrl+Enter</kbd> to save
              </span>
              
              <motion.button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              
              <motion.button
                onClick={handleSave}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''} group`}
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'items-end' : ''}`}>
        <div 
          className={`
            relative rounded-2xl px-4 py-3 shadow-sm
            ${isUser 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-auto' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
            }
          `}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark as any}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <motion.div
            className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none"
            onClick={() => setShowFullTime(!showFullTime)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showFullTime ? getRelativeTimeString(timestamp) : formatDistanceToNow(timestamp)}
          </motion.div>
          
          <motion.div 
            className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            {isUser && messageId && (
              <button 
                onClick={handleStartEdit}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Edit message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            <button 
              onClick={handleCopy}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Copy message"
            >
              {copied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}