"use client";

import { useMemo, useState } from "react";
import { getSliderStep } from "../../lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
};

export function SubscriptionSlider({ value, onChange, max = 2000 }: Props) {
  const [manualValue, setManualValue] = useState(value.toString());
  const step = useMemo(() => getSliderStep(value), [value]);

  const handleInput = (nextValue: number) => {
    const safeValue = Math.max(nextValue, 0.1);
    onChange(safeValue);
    setManualValue(safeValue.toString());
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-widest text-white/50">Monthly amount</label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={0.1}
            max={max}
            step={step}
            value={Math.min(value, max)}
            onChange={(event) => handleInput(parseFloat(event.target.value))}
            className="w-full"
          />
          <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm">${value.toFixed(2)}</div>
        </div>
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-white/50">Manual amount (no cap)</label>
        <input
          type="number"
          min={0.1}
          step={0.1}
          value={manualValue}
          onChange={(event) => {
            setManualValue(event.target.value);
            const parsed = parseFloat(event.target.value);
            if (!Number.isNaN(parsed)) {
              handleInput(parsed);
            }
          }}
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-white/50">
          Slider steps: $0.10 → $10, $1 → $100, $5 → $500, $10 above that.
        </p>
      </div>
    </div>
  );
}
