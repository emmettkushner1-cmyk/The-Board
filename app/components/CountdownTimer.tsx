"use client";

import { useEffect, useState } from "react";
import { getCountdownParts } from "../../lib/utils";

export function CountdownTimer() {
  const [parts, setParts] = useState(getCountdownParts());

  useEffect(() => {
    const interval = setInterval(() => {
      setParts(getCountdownParts());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 text-center text-sm">
      {Object.entries(parts).map(([label, value]) => (
        <div key={label} className="rounded-lg bg-white/10 px-4 py-2">
          <div className="text-lg font-semibold">{value}</div>
          <div className="text-[10px] uppercase tracking-widest text-white/60">{label}</div>
        </div>
      ))}
    </div>
  );
}
