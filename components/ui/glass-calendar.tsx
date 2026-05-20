import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  startOfMonth,
  getDay,
  getDaysInMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const DAY_LABELS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

export const GlassCalendar = React.forwardRef<HTMLDivElement, GlassCalendarProps>(
  ({ className, selectedDate: propSelectedDate, onDateSelect, ...props }, ref) => {
    const [currentMonth, setCurrentMonth] = React.useState(propSelectedDate || new Date());
    const [selectedDate, setSelectedDate] = React.useState(propSelectedDate || new Date());
    const [dir, setDir] = React.useState(1);

    const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      onDateSelect?.(date);
    };

    const prevMonth = () => {
      setDir(-1);
      setCurrentMonth(subMonths(currentMonth, 1));
    };

    const nextMonth = () => {
      setDir(1);
      setCurrentMonth(addMonths(currentMonth, 1));
    };

    // Build the grid: pad with nulls before the first day
    const grid = React.useMemo(() => {
      const start = startOfMonth(currentMonth);
      const totalDays = getDaysInMonth(currentMonth);
      // getDay returns 0=Sun, 1=Mon…6=Sat — matches DAY_LABELS order
      const offset = getDay(start);
      const cells: (Date | null)[] = Array(offset).fill(null);
      for (let i = 0; i < totalDays; i++) {
        cells.push(new Date(start.getFullYear(), start.getMonth(), i + 1));
      }
      // Pad end so we always have full rows
      while (cells.length % 7 !== 0) cells.push(null);
      return cells;
    }, [currentMonth]);

    const monthKey = format(currentMonth, "yyyy-MM");

    return (
      <div
        ref={ref}
        className={cn(
          "w-full rounded-2xl p-5",
          "bg-white/[0.04] border border-white/08",
          "text-charcoal font-sans",
          className
        )}
        {...props}
      >
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal/40 hover:text-rose hover:bg-rose/10 transition-all duration-200 cursor-pointer"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.p
              key={monthKey}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d > 0 ? 20 : -20 }),
                center: { opacity: 1, x: 0, transition: { duration: 0.25 } },
                exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -14 : 14, transition: { duration: 0.2 } }),
              }}
              initial="enter" animate="center" exit="exit"
              className="font-display font-light text-lg text-charcoal/90 capitalize tracking-wide"
            >
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </motion.p>
          </AnimatePresence>

          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal/40 hover:text-rose hover:bg-rose/10 transition-all duration-200 cursor-pointer"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[10px] font-sans font-medium text-charcoal/30 uppercase tracking-widest py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={monthKey}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d > 0 ? 24 : -24 }),
              center: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
              exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -16 : 16, transition: { duration: 0.2 } }),
            }}
            initial="enter" animate="center" exit="exit"
            className="grid grid-cols-7 gap-y-1"
          >
            {grid.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} />;
              }
              const selected = isSameDay(date, selectedDate);
              const today    = isToday(date);
              const isPast   = date < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <div key={format(date, "yyyy-MM-dd")} className="flex items-center justify-center py-0.5">
                  <button
                    onClick={() => !isPast && handleDateClick(date)}
                    disabled={isPast}
                    className={cn(
                      "relative w-8 h-8 rounded-full text-xs font-sans font-medium transition-all duration-200 flex items-center justify-center",
                      selected
                        ? "bg-gradient-to-br from-rose-deep to-rose text-white shadow-[0_4px_14px_rgba(212,97,140,0.4)]"
                        : today
                        ? "text-rose border border-rose/40 hover:bg-rose/10 cursor-pointer"
                        : isPast
                        ? "text-charcoal/20 cursor-not-allowed"
                        : "text-charcoal/70 hover:bg-rose/10 hover:text-rose cursor-pointer"
                    )}
                  >
                    {today && !selected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose" />
                    )}
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
);

GlassCalendar.displayName = "GlassCalendar";
