import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, CalendarPlus, AlertTriangle, RefreshCw, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface UpcomingMeeting {
  id: string;
  meeting_date: string;
  themes: string;
  participation_type: string;
}

const UpcomingMeetings = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["dashboard-upcoming-meetings", user?.id],
    enabled: !!user,
    retry: 1,
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("cib_meetings")
        .select("id, meeting_date, themes, participation_type")
        .gte("meeting_date", today)
        .order("meeting_date", { ascending: true })
        .limit(5);
      if (error) throw error;
      return (data || []) as UpcomingMeeting[];
    },
  });

  const loading = authLoading || (!!user && isLoading);

  return (
    <section
      aria-labelledby="proximas-reunioes-titulo"
      className="rounded-xl border border-border bg-card p-6 shadow-layered flex flex-col min-h-[200px]"
    >
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 id="proximas-reunioes-titulo" className="font-semibold text-foreground text-base">
          Próximas reuniões e prazos
        </h3>
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando reuniões">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : !user ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Entre na plataforma para ver as reuniões do seu território.
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate("/auth")} className="gap-2">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Entrar
          </Button>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-4" role="alert">
          <AlertTriangle className="h-6 w-6 text-destructive mb-2" aria-hidden="true" />
          <p className="text-sm text-foreground font-medium mb-1">Não foi possível carregar as reuniões</p>
          <p className="text-xs text-muted-foreground mb-3">Verifique sua conexão e tente novamente.</p>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
            Tentar novamente
          </Button>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Nenhuma reunião agendada. Agende a primeira reunião do colegiado.
          </p>
          <Button size="sm" onClick={() => navigate("/governanca")} className="gap-2">
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            Agendar reunião
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {data.map((meeting) => {
            const date = parseISO(meeting.meeting_date);
            return (
              <li key={meeting.id}>
                <button
                  type="button"
                  onClick={() => navigate("/governanca")}
                  className="w-full flex items-center gap-3 p-2 -mx-2 rounded-lg text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold leading-none">{format(date, "dd")}</span>
                    <span className="text-[10px] uppercase leading-none mt-0.5">
                      {format(date, "MMM", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{meeting.themes}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default UpcomingMeetings;
