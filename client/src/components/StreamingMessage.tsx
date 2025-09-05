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
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="relative group">
                      <SyntaxHighlighter
                        language={match[1]}
                        PreTag="div"
                        style={oneDark as any}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(String(children));
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs"
                      >
                        Copy
                      </button>
                    </div>
                  ) : (
                    <code className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                h1: ({ children }: any) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                h2: ({ children }: any) => <h2 className="text-lg font-semibold mt-3 mb-2">{children}</h2>,
                h3: ({ children }: any) => <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>,
                p: ({ children }: any) => <p className="mb-2">{children}</p>,
                ul: ({ children }: any) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                li: ({ children }: any) => <li className="mb-1">{children}</li>,
                blockquote: ({ children }: any) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-2 italic">{children}</blockquote>
                ),
                a: ({ href, children }: any) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {children}
                  </a>
                ),
              }}
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