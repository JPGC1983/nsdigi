import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, getDay, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Event {
  date: Date;
  title: string;
  type: "meeting" | "deadline" | "training";
}

const eventColors = {
  meeting: "bg-primary",
  deadline: "bg-destructive",
  training: "bg-secondary",
};

const CompactCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = getDay(monthStart);
  const emptyDays = Array(startDay).fill(null);

  // Fetch CIB meetings from database
  useEffect(() => {
    const fetchMeetings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("cib_meetings")
          .select("meeting_date, themes")
          .order("meeting_date", { ascending: true });

        if (error) {
          console.error("Error fetching meetings:", error);
          return;
        }

        if (data) {
          const mappedEvents: Event[] = data.map((meeting) => ({
            date: parseISO(meeting.meeting_date),
            title: meeting.themes || "Reunião CIB",
            type: "meeting" as const,
          }));
          setEvents(mappedEvents);
        }
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const hasEvent = (date: Date) => {
    return events.find((event) => isSameDay(event.date, date));
  };

  const handleDayClick = (day: Date) => {
    const event = hasEvent(day);
    if (event) {
      navigate("/governanca");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-xl border border-border bg-card p-5 shadow-layered hover:shadow-layered-lg transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Calendário CIB</h3>
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
              onClick={() => handleDayClick(day)}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-md text-xs cursor-pointer transition-colors relative",
                isToday(day)
                  ? "bg-primary text-primary-foreground font-bold"
                  : isSameMonth(day, currentMonth)
                  ? "text-foreground hover:bg-muted"
                  : "text-muted-foreground/50",
                event && "ring-2 ring-primary/50"
              )}
            >
              <span>{format(day, "d")}</span>
              {event && (
                <div
                  className={cn(
                    "absolute bottom-0.5 w-1.5 h-1.5 rounded-full",
                    eventColors[event.type]
                  )}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">Carregando eventos...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Próximas reuniões CIB</p>
          <div className="space-y-2">
            {events
              .filter((event) => event.date >= new Date())
              .slice(0, 3)
              .map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md p-1 -m-1 transition-colors"
                  onClick={() => navigate("/governanca")}
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
      ) : (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">Nenhuma reunião agendada</p>
        </div>
      )}
    </motion.div>
  );
};

export default CompactCalendar;
