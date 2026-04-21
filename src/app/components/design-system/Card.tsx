interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  return (
    <div
      className={`border border-black/10 bg-white p-6 ${
        hoverable ? 'transition-all hover:border-black/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
