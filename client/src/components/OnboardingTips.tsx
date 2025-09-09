import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingTips() {
  const [currentTip, setCurrentTip] = useState(0);
  const [showTips, setShowTips] = useState(true);

  const tips = [
    {
      title: "Welcome to Chat Buddy AI!",
      description: "Your intelligent conversational companion powered by OpenAI",
      icon: "👋"
    },
    {
      title: "Start a Conversation",
      description: "Type your message below or click a suggestion to begin",
      icon: "💬"
    },
    {
      title: "Browse Your History",
      description: "All conversations are automatically saved and searchable",
      icon: "📚"
    },
    {
      title: "Keyboard Shortcuts",
      description: "Press ⌘+K to open the command palette",
      icon: "⌨️"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentTip < tips.length - 1) {
        setCurrentTip(prev => prev + 1);
      } else {
        setShowTips(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentTip]);

  if (!showTips) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 right-6 z-50 max-w-sm"
      >
        <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-xl">
          <button
            onClick={() => setShowTips(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white text-gray-800 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md"
          >
            ✕
          </button>
          
          <div className="flex items-start gap-3">
            <span className="text-2xl">{tips[currentTip].icon}</span>
            <div>
              <h3 className="font-semibold mb-1">{tips[currentTip].title}</h3>
              <p className="text-sm opacity-90">{tips[currentTip].description}</p>
            </div>
          </div>
          
          <div className="flex gap-1 mt-3 justify-center">
            {tips.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentTip ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}