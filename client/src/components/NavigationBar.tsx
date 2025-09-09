import AnimatedLogo from './AnimatedLogo';

interface NavigationBarProps {
  showLogo?: boolean;
}

export default function NavigationBar({ showLogo = true }: NavigationBarProps) {
  return (
    <nav className="flex items-center justify-between w-full">
      {showLogo && (
        <div className="flex items-center">
          {/* Only AnimatedLogo - no duplicate text */}
          <AnimatedLogo />
        </div>
      )}
    </nav>
  );
}