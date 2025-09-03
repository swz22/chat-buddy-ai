import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface StreamingMessageProps {
  content: string;
  isComplete: boolean;
}

export default function StreamingMessage({ content, isComplete }: StreamingMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      const messageEl = messageRef.current;
      const lastChild = messageEl.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex gap-3 group"
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div 
          ref={messageRef}
          className={`relative prose prose-sm max-w-none dark:prose-invert ${!isComplete ? 'streaming-message' : ''}`}
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