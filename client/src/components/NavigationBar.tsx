import Logo from './Logo';

interface NavigationBarProps {
  showLogo?: boolean;
}

export default function NavigationBar({ showLogo = true }: NavigationBarProps) {
  return (
    <nav className="flex items-center justify-between w-full">
      {showLogo && (
        <div className="flex items-center gap-3">
          <Logo size="small" />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Chat Buddy AI
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
              Powered by OpenAI
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}