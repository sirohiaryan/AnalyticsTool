'use client';

import SelectDropdown from '@/components/controls/SelectDropdown';
import { DateRange } from '@/lib/types';

type DateRangeSelectorProps = {
  range: DateRange;
  customRange: { start: string; end: string };
  onRangeChange: (range: DateRange) => void;
  onCustomRangeChange: (custom: { start: string; end: string }) => void;
};

export default function DateRangeSelector({
  range,
  customRange,
  onRangeChange,
  onCustomRangeChange,
}: DateRangeSelectorProps) {
  return (
    <div className="space-y-3">
      <SelectDropdown
        label="Global Date Range"
        value={range}
        onChange={onRangeChange}
        options={[
          { label: 'Last 7 days', value: '7d' },
          { label: 'Last 30 days', value: '30d' },
          { label: 'Last 90 days', value: '90d' },
          { label: 'Custom', value: 'custom' },
        ]}
      />
      {range === 'custom' && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <input
            type="date"
            value={customRange.start}
            onChange={(event) => onCustomRangeChange({ ...customRange, start: event.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2"
          />
          <input
            type="date"
            value={customRange.end}
            onChange={(event) => onCustomRangeChange({ ...customRange, end: event.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2"
          />
        </div>
      )}
    </div>
  );
}
