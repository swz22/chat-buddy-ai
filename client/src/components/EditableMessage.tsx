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
  const [showEditHint, setShowEditHint] = useState(false);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setEditContent(content);
    setIsEditing(true);
    setShowEditHint(false);
  };

  if (isEditing) {
    return (
      <motion.div
        className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}
        variants={messageVariants}
      >
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-br from-gray-600 to-gray-800' 
              : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'
          }`}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={isUser 
                  ? "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  : "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                } 
              />
            </svg>
          </div>
        </div>
        
        <div className={`flex-1 max-w-3xl ${isUser ? 'items-end' : ''}`}>
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-blue-500 focus:border-blue-600 focus:outline-none resize-none"
              style={{ minHeight: '60px' }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
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
      onMouseEnter={() => isUser && setShowEditHint(true)}
      onMouseLeave={() => setShowEditHint(false)}
    >
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-br from-gray-600 to-gray-800' 
            : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'
        }`}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d={isUser 
                ? "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                : "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              } 
            />
          </svg>
        </div>
      </div>
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'items-end' : ''}`}>
        <div className={`
          relative rounded-2xl px-4 py-3 shadow-sm transition-all
          ${isUser 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-auto hover:shadow-lg' 
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
          }
          ${isUser && showEditHint ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        `}>
          {/* Edit hint tooltip for user messages */}
          {isUser && showEditHint && messageId && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-8 right-0 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap"
            >
              Click edit icon to modify message ✏️
              <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
            </motion.div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        language={match[1]}
                        PreTag="div"
                        style={oneDark as any}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-sm" {...props}>
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
        
        <div className={`mt-1 flex items-center gap-2 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
          <motion.div
            className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none"
            onClick={() => setShowFullTime(!showFullTime)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showFullTime ? getRelativeTimeString(timestamp) : formatDistanceToNow(timestamp)}
          </motion.div>
          
          <motion.div 
            className={`flex gap-1 ${isUser ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            {isUser && messageId && (
              <motion.button 
                onClick={handleStartEdit}
                className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Edit this message"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
            )}
            
            <motion.button 
              onClick={handleCopy}
              className="p-1.5 text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Copy message"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}