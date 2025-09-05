import { useMemo } from 'react';

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

export default function HighlightedText({ text, query, className = '' }: HighlightedTextProps) {
  const parts = useMemo(() => {
    if (!query || !text) return [{ text, highlighted: false }];
    
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    if (searchTerms.length === 0) return [{ text, highlighted: false }];
    
    const regex = new RegExp(`(${searchTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const textParts: { text: string; highlighted: boolean }[] = [];
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        textParts.push({
          text: text.slice(lastIndex, match.index),
          highlighted: false
        });
      }
      
      textParts.push({
        text: match[0],
        highlighted: true
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      textParts.push({
        text: text.slice(lastIndex),
        highlighted: false
      });
    }
    
    return textParts;
  }, [text, query]);

  return (
    <span className={className}>
      {parts.map((part, index) => (
        <span
          key={index}
          className={part.highlighted ? 'bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded' : ''}
        >
          {part.text}
        </span>
      ))}
    </span>
  );
}