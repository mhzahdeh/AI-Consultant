interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'outline';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-black text-white',
    muted: 'bg-black/5 text-black/70',
    outline: 'border border-black/10 bg-transparent text-black',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs ${variants[variant]}`}>
      {children}
    </span>
  );
}
