import { Fragment } from 'react';

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export default function HighlightedText({
  text,
  query,
  className = '',
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800 font-medium'
}: HighlightedTextProps) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (index % 2 === 1 && part.toLowerCase() === query.toLowerCase()) {
          return (
            <mark key={index} className={highlightClassName}>
              {part}
            </mark>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </span>
  );
}