interface TextareaProps {
  label: string;
  id: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

export function Textarea({ label, id, placeholder, value, onChange, rows = 4 }: TextareaProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-2 block text-sm text-black">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none border border-black/10 bg-white py-3 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none"
      />
    </div>
  );
}
