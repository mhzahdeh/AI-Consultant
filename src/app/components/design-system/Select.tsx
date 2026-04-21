import { ChevronDown } from 'lucide-react';

interface SelectProps {
  label: string;
  id: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function Select({ label, id, options, value, onChange }: SelectProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-sm text-black">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="w-full appearance-none border border-black/10 bg-white py-3 px-4 pr-10 text-sm text-black transition-colors focus:border-black focus:outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
      </div>
    </div>
  );
}
