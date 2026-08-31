"use client";

import { useEffect, useRef, useState } from "react";

type Option = { value: string; label: string };

export default function ThemedSelect({
  value,
  options,
  onChange,
  className = "",
  ariaLabel,
}: {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className={`themed-select ${className}`} ref={ref}>
      <button type="button" className="themed-select-trigger" aria-label={ariaLabel} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <span className="themed-select-label">{selected?.label ?? "Select"}</span><span className="themed-select-arrow" aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="themed-select-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button type="button" role="option" aria-selected={option.value === value} className={option.value === value ? "selected" : ""} key={option.value} onClick={() => { onChange(option.value); setOpen(false); }}>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
