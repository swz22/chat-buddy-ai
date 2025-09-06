import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { messageVariants } from '../utils/animations';
import type { Components } from 'react-markdown';

interface StreamingMessageProps {
  content: string;
  isComplete: boolean;
}

export default function StreamingMessage({ content, isComplete }: StreamingMessageProps) {
  const markdownComponents: Components = {
    code({ node, className, children, ...props }) {
      const inline = !className;
      const match = /language-(\w+)/.exec(className || '');
      
      if (!inline && match) {
        return (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <motion.div
      className="flex gap-3 mb-6"
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      <div className="flex-1 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {content}
            </ReactMarkdown>
          </div>
          {!isComplete && (
            <motion.span
              className="inline-block w-2 h-4 bg-gray-400 dark:bg-gray-500 ml-1"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}