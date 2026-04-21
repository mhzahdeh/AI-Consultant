interface InputProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function Input({ label, id, type = 'text', placeholder, value, onChange, error }: InputProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-sm text-black">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border ${error ? 'border-black' : 'border-black/10'} bg-white py-3 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none`}
      />
      {error && (
        <p className="mt-1.5 text-xs text-black/60">{error}</p>
      )}
    </div>
  );
}
