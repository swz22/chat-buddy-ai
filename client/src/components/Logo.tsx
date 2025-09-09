interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Logo({ 
  size = 'medium',
  className = '' 
}: LogoProps) {
  const dimensions = {
    small: { width: 48, height: 48 },
    medium: { width: 80, height: 80 },
    large: { width: 200, height: 200 }
  };

  const { width, height } = dimensions[size];

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 128 128" 
      width={width} 
      height={height}
      className={className}
    >
      <circle cx="64" cy="64" r="58" fill="#fff" stroke="#666" strokeWidth="3"/>
      <rect x="30" y="38" width="68" height="52" rx="12" fill="none" stroke="#666" strokeWidth="3"/>
      <circle cx="48" cy="64" r="4" fill="#666"/>
      <circle cx="80" cy="64" r="4" fill="#666"/>
      <path d="M48 76 Q64 86 80 76" stroke="#666" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}