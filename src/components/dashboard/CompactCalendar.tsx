import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  date: Date;
  title: string;
  type: "meeting" | "deadline" | "training";
}

// Empty events - will be populated from backend
const events: Event[] = [];

const eventColors = {
  meeting: "bg-primary",
  deadline: "bg-destructive",
  training: "bg-secondary",
};

const CompactCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = getDay(monthStart);
  const emptyDays = Array(startDay).fill(null);

  const hasEvent = (date: Date) => {
    return events.find(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Calendário</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[100px] text-center capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const event = hasEvent(day);
          return (
            <motion.div
              key={day.toISOString()}
              whileHover={{ scale: 1.1 }}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-md text-xs cursor-pointer transition-colors relative",
                isToday(day)
                  ? "bg-primary text-primary-foreground font-bold"
                  : isSameMonth(day, currentMonth)
                  ? "text-foreground hover:bg-muted"
                  : "text-muted-foreground/50"
              )}
            >
              <span>{format(day, "d")}</span>
              {event && (
                <div
                  className={cn(
                    "absolute bottom-0.5 w-1 h-1 rounded-full",
                    eventColors[event.type]
                  )}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {events.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Próximos eventos</p>
          <div className="space-y-2">
            {events.slice(0, 3).map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className={cn("w-2 h-2 rounded-full", eventColors[event.type])} />
                <span className="text-xs text-foreground truncate flex-1">{event.title}</span>
                <span className="text-xs text-muted-foreground">
                  {format(event.date, "dd/MM")}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CompactCalendar;
