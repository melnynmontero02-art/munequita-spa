"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { slotsForDate, listenBooked } from "@/lib/slots";

interface TimeSlotsProps {
  date: Date;
  selected: string | null;
  onSelect: (time: string) => void;
}

export function TimeSlots({ date, selected, onSelect }: TimeSlotsProps) {
  const [booked,  setBooked]  = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const dateStr = format(date, "yyyy-MM-dd");
  const slots   = slotsForDate(date);

  const normalise = useCallback((raw: Set<string>) => {
    // Firebase keys use "09-00", normalise back to "09:00"
    return new Set([...raw].map(k => k.replace("-", ":")));
  }, []);

  useEffect(() => {
    setLoading(true);
    // Reset selection when date changes
    onSelect("");
    const unsub = listenBooked(dateStr, (raw) => {
      setBooked(normalise(raw));
      setLoading(false);
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-charcoal/40 text-[10px] font-sans tracking-widest uppercase">
          Hora preferida
        </label>
        {loading
          ? <span className="text-muted font-sans text-[10px] animate-pulse">Cargando horarios…</span>
          : <span className="text-charcoal/30 font-sans text-[10px]">
              {slots.filter(s => !booked.has(s)).length} horarios disponibles
            </span>
        }
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {slots.map((slot) => {
          const isBooked   = booked.has(slot);
          const isSelected = selected === slot;
          return (
            <button
              key={slot}
              type="button"
              disabled={isBooked || loading}
              onClick={() => onSelect(isSelected ? "" : slot)}
              className={[
                "py-2.5 rounded-xl text-[11px] font-sans font-medium transition-all duration-200",
                isBooked
                  ? "bg-white/[0.02] border border-white/[0.04] text-charcoal/20 cursor-not-allowed line-through"
                  : isSelected
                  ? "bg-gradient-to-r from-rose-deep to-rose text-white shadow-[0_4px_14px_rgba(212,97,140,0.4)] cursor-pointer"
                  : "bg-white/[0.04] border border-white/08 text-charcoal/55 hover:text-rose hover:border-rose/35 hover:bg-rose/05 cursor-pointer",
              ].join(" ")}
            >
              {slot}
            </button>
          );
        })}
      </div>

      {!loading && selected && (
        <p className="text-rose/70 font-sans text-[11px] mt-1">
          Hora seleccionada: <span className="text-rose font-semibold">{selected}</span>
        </p>
      )}
    </div>
  );
}
