export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-purple-200">Settings</h2>
      <div className="rounded-xl border border-slate-800 bg-surface p-4 text-sm text-slate-300">
        <p>Data Provider: mock (switch to supabase via createDataProvider('supabase')).</p>
        <p className="mt-2">Theme: Dark + Purple Accent.</p>
        <p className="mt-2">Roadmap: add RBAC, export pipelines, and creator cohort drilldowns.</p>
      </div>
    </div>
  );
}
