import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ActivityType = "forum" | "course" | "document" | "meeting";

export interface DashboardActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
  link: string;
}

export interface DashboardSummary {
  profissionais: number;
  cursos: number;
  trilhas: number;
  discussoesAtivas: number;
  atividades: DashboardActivity[];
}

const EMPTY: DashboardSummary = {
  profissionais: 0,
  cursos: 0,
  trilhas: 0,
  discussoesAtivas: 0,
  atividades: [],
};

/**
 * Real counts and recent activity for the Dashboard. All reads go through the
 * normal table policies (territorial scope), except the aggregate count of
 * active professionals, which uses a count-only function (no personal data).
 */
export const useDashboardSummary = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["dashboard-summary", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<DashboardSummary> => {
      const [prof, cursos, trilhas, topicos, ultCursos, ultMateriais, ultTopicos, ultReunioes] =
        await Promise.all([
          supabase.rpc("count_active_professionals"),
          supabase.from("courses").select("id", { count: "exact", head: true }),
          supabase.from("trails").select("id", { count: "exact", head: true }),
          supabase
            .from("forum_topics")
            .select("id", { count: "exact", head: true })
            .in("status", ["open", "awaiting_feedback"]),
          supabase.from("courses").select("id, title, category, created_at").order("created_at", { ascending: false }).limit(3),
          supabase.from("materials").select("id, title, material_type, created_at").order("created_at", { ascending: false }).limit(3),
          supabase
            .from("forum_topics")
            .select("id, title, created_at, forums(slug, name)")
            .order("created_at", { ascending: false })
            .limit(3),
          supabase.from("colegiado_meetings").select("id, titulo, data_reuniao, created_at").order("created_at", { ascending: false }).limit(3),
        ]);

      const atividades: DashboardActivity[] = [
        ...(ultCursos.data || []).map((c) => ({
          id: `curso-${c.id}`,
          type: "course" as const,
          title: c.title,
          description: `Novo curso · ${c.category}`,
          createdAt: c.created_at,
          link: "/educacao",
        })),
        ...(ultMateriais.data || []).map((m) => ({
          id: `material-${m.id}`,
          type: "document" as const,
          title: m.title,
          description: "Novo material no repositório",
          createdAt: m.created_at,
          link: "/repositorio",
        })),
        ...(ultTopicos.data || []).map((t) => {
          const forum = t.forums as { slug: string; name: string } | null;
          return {
            id: `topico-${t.id}`,
            type: "forum" as const,
            title: t.title,
            description: forum ? `Nova discussão em ${forum.name}` : "Nova discussão",
            createdAt: t.created_at,
            link: forum ? `/foruns/${forum.slug}/topico/${t.id}` : "/foruns",
          };
        }),
        ...(ultReunioes.data || []).map((r) => ({
          id: `reuniao-${r.id}`,
          type: "meeting" as const,
          title: r.titulo,
          description: "Reunião do colegiado agendada",
          createdAt: r.created_at,
          link: "/governanca",
        })),
      ]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6);

      return {
        profissionais: (prof.data as number | null) ?? 0,
        cursos: cursos.count ?? 0,
        trilhas: trilhas.count ?? 0,
        discussoesAtivas: topicos.count ?? 0,
        atividades,
      };
    },
  });

  return { summary: query.data ?? EMPTY, isLoading: query.isLoading, isError: query.isError };
};
