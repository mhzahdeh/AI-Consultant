import { ArrowRight } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: boolean;
}

export function Button({ variant = 'primary', children, onClick, type = 'button', className = '', icon = false }: ButtonProps) {
  const baseStyles = 'px-6 py-3 text-sm transition-all inline-flex items-center gap-2';

  const variants = {
    primary: 'border border-black bg-black text-white hover:bg-black/90',
    secondary: 'border border-black/10 bg-white text-black hover:border-black/20 hover:bg-black/[0.01]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
      {icon && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}
