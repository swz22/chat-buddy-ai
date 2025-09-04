import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { messageVariants } from '../utils/animations';

interface StreamingMessageProps {
  content: string;
  isComplete: boolean;
}

export default function StreamingMessage({ content, isComplete }: StreamingMessageProps) {
  return (
    <motion.div
      className="flex gap-3 mb-6 group"
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex-shrink-0">
        <motion.div 
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
          animate={!isComplete ? {
            boxShadow: [
              '0 10px 15px -3px rgba(59, 130, 246, 0.5)',
              '0 10px 25px -3px rgba(147, 51, 234, 0.5)',
              '0 10px 15px -3px rgba(59, 130, 246, 0.5)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </motion.div>
      </div>
      
      <div className="flex-1 max-w-3xl">
        <div 
          className={`
            relative rounded-2xl px-4 py-3 shadow-sm overflow-hidden
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
            border border-gray-200 dark:border-gray-700
            ${!isComplete ? 'streaming-message' : ''}
          `}
        >
          {!isComplete && (
            <div className="plasma-stream-overlay" />
          )}
          
          <div className={!isComplete ? 'streaming-text' : ''}>
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
            
            {!isComplete && <span className="plasma-cursor" />}
          </div>
          
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="completion-flash"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}