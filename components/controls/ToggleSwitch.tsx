'use client';

type ToggleSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm">
      <span>{label}</span>
      <button
        type="button"
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 rounded-full p-1 transition ${checked ? 'bg-[rgb(var(--accent-rgb))]' : 'bg-slate-700'}`}
      >
        <span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  );
}
