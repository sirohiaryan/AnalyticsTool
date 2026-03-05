'use client';

type Option<T extends string> = {
  label: string;
  value: T;
};

type SelectDropdownProps<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

export default function SelectDropdown<T extends string>({ label, value, options, onChange }: SelectDropdownProps<T>) {
  return (
    <label className="space-y-2 text-sm">
      <span className="text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
