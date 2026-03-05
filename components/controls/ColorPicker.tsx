'use client';

import { AccentColor } from '@/lib/types';

const palette: Record<AccentColor, string> = {
  purple: '#8b5cf6',
  blue: '#3b82f6',
  emerald: '#10b981',
};

type ColorPickerProps = {
  value: AccentColor;
  onChange: (color: AccentColor) => void;
};

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-300">Accent Color</p>
      <div className="flex gap-3">
        {(Object.keys(palette) as AccentColor[]).map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`h-8 w-8 rounded-full border-2 transition hover:scale-105 ${value === color ? 'border-white' : 'border-transparent'}`}
            style={{ backgroundColor: palette[color] }}
            aria-label={`Use ${color} accent`}
          />
        ))}
      </div>
    </div>
  );
}
