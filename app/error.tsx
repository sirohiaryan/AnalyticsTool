'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-slate-400">Please retry. If issue persists, contact support.</p>
      <button onClick={reset} className="rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700">
        Try again
      </button>
    </div>
  );
}
