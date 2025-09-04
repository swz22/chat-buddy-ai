import { useState } from 'react';
import EditableMessage from './EditableMessage';
import MessageReactions from './MessageReactions';

interface EnhancedMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  onEdit?: (newContent: string) => void;
  onRegenerate?: () => void;
  index: number;
}

export default function EnhancedMessage({
  role,
  content,
  timestamp = new Date(),
  onEdit,
  onRegenerate,
  index
}: EnhancedMessageProps) {
  const [currentContent, setCurrentContent] = useState(content);

  const handleEdit = (newContent: string) => {
    setCurrentContent(newContent);
    onEdit?.(newContent);
  };

  const handleReaction = (emoji: string, action: 'add' | 'remove') => {
    console.log(`Message ${index}: ${action} reaction ${emoji}`);
  };

  return (
    <div className="relative">
      <EditableMessage
        role={role}
        content={currentContent}
        timestamp={timestamp}
        onEdit={handleEdit}
        onRegenerate={onRegenerate}
        canEdit={role === 'user'}
      />
      {role === 'assistant' && (
        <div className="ml-11">
          <MessageReactions onReaction={handleReaction} />
        </div>
      )}
    </div>
  );
}