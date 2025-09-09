import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EditableMessage from './EditableMessage';
import StreamingMessage from './StreamingMessage';
import ThinkingAnimation from './ThinkingAnimation';
import WelcomeScreen from './WelcomeScreen';
import EnhancedChatInput from './EnhancedChatInput';

interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatViewProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  isThinking: boolean;
  bufferedContent: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  onEditMessage?: (id: number, newContent: string) => void;
  connected: boolean;
}

export default function ChatView({
  messages,
  isStreaming,
  isThinking,
  bufferedContent,
  inputValue,
  onInputChange,
  onSendMessage,
  onEditMessage,
  connected
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, bufferedContent]);

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isStreaming ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  {message.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[70%]">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm">
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className="max-w-[70%]">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">AI</span>
                          </div>
                          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 dark:border-gray-700">
                            {onEditMessage && message.id ? (
                              <EditableMessage
                                content={message.content}
                                onEdit={(newContent) => onEditMessage(message.id!, newContent)}
                              />
                            ) : (
                              <div className="message-content">
                                <p className="text-sm">{message.content}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-6"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">AI</span>
                  </div>
                  <ThinkingAnimation />
                </div>
              </motion.div>
            )}

            {isStreaming && bufferedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-6"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">AI</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 dark:border-gray-700">
                    <StreamingMessage content={bufferedContent} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <EnhancedChatInput
        value={inputValue}
        onChange={onInputChange}
        onSendMessage={onSendMessage}
        disabled={!connected || isStreaming}
        placeholder={connected ? "Message Chat Buddy AI..." : "Connecting..."}
      />
    </div>
  );
}