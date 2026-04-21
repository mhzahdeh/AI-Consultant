import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface BackButtonProps {
  fallbackTo?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  fallbackTo = '/dashboard',
  label = 'Back',
  className = 'inline-flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black',
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo);
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
