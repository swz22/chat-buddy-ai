import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import * as styles from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface MarkdownMessageProps {
  content: string;
  isUser: boolean;
}

export default function MarkdownMessage({ content, isUser }: MarkdownMessageProps) {
  const { theme } = useTheme();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isUser) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        h1: ({ children }: any) => <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">{children}</h1>,
        h2: ({ children }: any) => <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-900 dark:text-gray-100">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-base font-semibold mt-2 mb-1 text-gray-900 dark:text-gray-100">{children}</h3>,
        p: ({ children }: any) => <p className="mb-2 text-gray-900 dark:text-gray-100 leading-relaxed">{children}</p>,
        ul: ({ children }: any) => <ul className="list-disc pl-5 mb-2 text-gray-900 dark:text-gray-100">{children}</ul>,
        ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-2 text-gray-900 dark:text-gray-100">{children}</ol>,
        li: ({ children }: any) => <li className="mb-1">{children}</li>,
        blockquote: ({ children }: any) => (
          <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-1 my-2 italic text-gray-700 dark:text-gray-300">
            {children}
          </blockquote>
        ),
        code: ({ inline, className, children, ...props }: any) => {
          let classNameString = '';
          if (typeof className === 'string') {
            classNameString = className;
          } else if (Array.isArray(className)) {
            classNameString = className.join(' ');
          }
          
          const match = /language-(\w+)/.exec(classNameString);
          const codeString = String(children).replace(/\n$/, '');
          
          if (!inline && match) {
            return (
              <div className="relative group my-3">
                <div className="absolute right-2 top-2 z-10">
                  <motion.button
                    onClick={() => handleCopyCode(codeString)}
                    className="px-2 py-1 text-xs bg-gray-700 dark:bg-gray-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copiedCode === codeString ? 'Copied!' : 'Copy'}
                  </motion.button>
                </div>
                <SyntaxHighlighter
                  style={theme === 'dark' ? styles.vscDarkPlus : styles.vs}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg text-sm"
                  showLineNumbers
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          }
          
          return (
            <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        a: ({ href, children }: any) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {children}
          </a>
        ),
        table: ({ children }: any) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              {children}
            </table>
          </div>
        ),
        th: ({ children }: any) => (
          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left">
            {children}
          </th>
        ),
        td: ({ children }: any) => (
          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}