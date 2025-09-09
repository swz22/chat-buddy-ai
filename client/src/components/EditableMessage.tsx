import { useState } from 'react';
import { motion } from 'framer-motion';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface EditableMessageProps {
  message: Message;
  onEdit?: (newContent: string) => void;
}

export default function EditableMessage({ message, onEdit }: EditableMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSave = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 p-4 rounded-lg ${
        isUser 
          ? 'bg-blue-50 dark:bg-blue-900/20 ml-auto max-w-[80%]' 
          : 'bg-gray-50 dark:bg-gray-800/50 mr-auto max-w-[80%]'
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
          : 'bg-gradient-to-br from-purple-500 to-purple-600'
      }`}>
        {isUser ? 'U' : 'AI'}
      </div>
      
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <p className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {message.content}
            </p>
            {isUser && onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-700 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {message.timestamp && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}