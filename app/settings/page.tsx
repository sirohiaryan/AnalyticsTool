'use client';

import ColorPicker from '@/components/controls/ColorPicker';
import DateRangeSelector from '@/components/controls/DateRangeSelector';
import SelectDropdown from '@/components/controls/SelectDropdown';
import ToggleSwitch from '@/components/controls/ToggleSwitch';
import { useSettings } from '@/components/providers/SettingsProvider';

export default function SettingsPage() {
  const {
    providerMode,
    setProviderMode,
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    dateRange,
    setDateRange,
    customRange,
    setCustomRange,
    featureFlags,
    setFeatureFlag,
  } = useSettings();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--accent-rgb))' }}>Settings</h2>

      <section className="card p-4 space-y-3">
        <h3 className="font-medium">Data Provider</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="rounded-lg border border-slate-700 p-3">
            <input
              type="radio"
              className="mr-2"
              checked={providerMode === 'mock'}
              onChange={() => setProviderMode('mock')}
            />
            Mock
          </label>
          <label className="rounded-lg border border-slate-700 p-3">
            <input
              type="radio"
              className="mr-2"
              checked={providerMode === 'dataset'}
              onChange={() => setProviderMode('dataset')}
            />
            Dataset (TV series)
          </label>
          <label className="rounded-lg border border-slate-700 p-3">
            <input
              type="radio"
              className="mr-2"
              checked={providerMode === 'supabase'}
              onChange={() => setProviderMode('supabase')}
            />
            Supabase (placeholder)
          </label>
        </div>
        {providerMode === 'supabase' && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            Supabase mode is a placeholder in this build. Configure provider implementation before production use.
          </div>
        )}
      </section>

      <section className="card p-4 space-y-3">
        <h3 className="font-medium">Theme</h3>
        <SelectDropdown
          label="Theme Mode"
          value={themeMode}
          onChange={setThemeMode}
          options={[
            { label: 'Dark', value: 'dark' },
            { label: 'Light', value: 'light' },
          ]}
        />
        <ColorPicker value={accentColor} onChange={setAccentColor} />
      </section>

      <section className="card p-4 space-y-3">
        <h3 className="font-medium">Analytics Controls</h3>
        <DateRangeSelector
          range={dateRange}
          customRange={customRange}
          onRangeChange={setDateRange}
          onCustomRangeChange={setCustomRange}
        />
      </section>

      <section className="card p-4 space-y-3">
        <h3 className="font-medium">Feature Flags</h3>
        <ToggleSwitch
          label="Enable Cohort Analysis"
          checked={featureFlags.cohortAnalysis}
          onChange={(enabled) => setFeatureFlag('cohortAnalysis', enabled)}
        />
        <ToggleSwitch
          label="Enable A/B Testing Insights"
          checked={featureFlags.abTestingInsights}
          onChange={(enabled) => setFeatureFlag('abTestingInsights', enabled)}
        />
        <ToggleSwitch
          label="Enable Revenue Forecasting"
          checked={featureFlags.revenueForecasting}
          onChange={(enabled) => setFeatureFlag('revenueForecasting', enabled)}
        />
      </section>
    </div>
  );
}
