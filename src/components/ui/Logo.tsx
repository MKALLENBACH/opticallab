import Image from 'next/image';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

const sizeMap = {
  sm: { full: { w: 120, h: 30 }, icon: 24 },
  md: { full: { w: 150, h: 38 }, icon: 32 },
  lg: { full: { w: 200, h: 50 }, icon: 40 },
};

export function Logo({ variant = 'full', size = 'md', light = true }: LogoProps) {
  if (variant === 'icon') {
    return (
      <Image
        src="/logo-icon.svg"
        alt="LenteLink"
        width={sizeMap[size].icon}
        height={sizeMap[size].icon}
        className="flex-shrink-0"
        priority
      />
    );
  }

  const dims = sizeMap[size].full;
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo-icon.svg"
        alt=""
        width={sizeMap[size].icon}
        height={sizeMap[size].icon}
        className="flex-shrink-0"
        priority
      />
      <span
        className="font-bold tracking-tight"
        style={{
          fontSize: size === 'lg' ? '1.5rem' : size === 'md' ? '1.125rem' : '0.9375rem',
          color: light ? '#ffffff' : 'var(--color-text-base)',
          letterSpacing: '-0.03em',
        }}
      >
        Lente<span style={{ color: '#818cf8' }}>Link</span>
      </span>
    </div>
  );
}
