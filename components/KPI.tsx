type KPIProps = {
  label: string;
  value: string;
};

export default function KPI({ label, value }: KPIProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-surface p-4 shadow-glow">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-purple-200">{value}</p>
    </div>
  );
}
