import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  enrolled: number;
  category: string;
  level: "basico" | "intermediario" | "avancado";
  format: "online" | "presencial" | "hibrido";
  url: string | null;
  progress?: number;
  created_at: string;
}

export interface Trail {
  id: string;
  title: string;
  description: string | null;
  courses_count: number;
  total_hours: number;
  enrolled: number;
  progress?: number;
  created_at: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  duration: string;
  level: "basico" | "intermediario" | "avancado";
  format: "online" | "presencial" | "hibrido";
  url: string;
}

export interface TrailFormData {
  title: string;
  description: string;
  totalHours: number;
  category?: string;
  level?: string;
}

export const useEducacao = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar cursos
  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Se o usuário estiver logado, buscar o progresso dele
      if (user) {
        const { data: enrollments } = await supabase
          .from("course_enrollments")
          .select("course_id, progress")
          .eq("user_id", user.id);

        const coursesWithProgress = (data || []).map((course) => {
          const enrollment = enrollments?.find((e) => e.course_id === course.id);
          return {
            ...course,
            level: course.level as "basico" | "intermediario" | "avancado",
            format: course.format as "online" | "presencial" | "hibrido",
            progress: enrollment?.progress,
          };
        });

        setCourses(coursesWithProgress);
        
        // Filtrar cursos em que o usuário está inscrito
        const enrolled = coursesWithProgress.filter((c) => c.progress !== undefined);
        setEnrolledCourses(enrolled);
      } else {
        setCourses(
          (data || []).map((course) => ({
            ...course,
            level: course.level as "basico" | "intermediario" | "avancado",
            format: course.format as "online" | "presencial" | "hibrido",
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
      toast.error("Erro ao carregar cursos");
    }
  };

  // Carregar trilhas
  const fetchTrails = async () => {
    try {
      const { data, error } = await supabase
        .from("trails")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Se o usuário estiver logado, buscar o progresso dele
      if (user) {
        const { data: enrollments } = await supabase
          .from("trail_enrollments")
          .select("trail_id, progress")
          .eq("user_id", user.id);

        const trailsWithProgress = (data || []).map((trail) => {
          const enrollment = enrollments?.find((e) => e.trail_id === trail.id);
          return {
            ...trail,
            progress: enrollment?.progress,
          };
        });

        setTrails(trailsWithProgress);
      } else {
        setTrails(data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar trilhas:", error);
      toast.error("Erro ao carregar trilhas");
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCourses(), fetchTrails()]);
      setIsLoading(false);
    };
    loadData();
  }, [user]);

  // Adicionar curso
  const addCourse = async (formData: CourseFormData): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar cursos");
      return false;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("courses").insert({
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        duration: formData.duration || null,
        level: formData.level,
        format: formData.format,
        url: formData.url || null,
        created_by: user.id,
      });

      if (error) {
        console.error("Erro ao adicionar curso:", error);
        if (error.code === "42501") {
          toast.error("Você não tem permissão para adicionar cursos. Apenas administradores e coordenadores podem fazer isso.");
        } else {
          toast.error("Erro ao adicionar curso");
        }
        return false;
      }

      toast.success(`Curso "${formData.title}" adicionado com sucesso!`);
      await fetchCourses();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar curso:", error);
      toast.error("Erro ao adicionar curso");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Adicionar trilha
  const addTrail = async (formData: TrailFormData): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar trilhas");
      return false;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("trails").insert({
        title: formData.title,
        description: formData.description || null,
        total_hours: formData.totalHours,
        created_by: user.id,
      });

      if (error) {
        console.error("Erro ao adicionar trilha:", error);
        if (error.code === "42501") {
          toast.error("Você não tem permissão para adicionar trilhas. Apenas administradores e coordenadores podem fazer isso.");
        } else {
          toast.error("Erro ao adicionar trilha");
        }
        return false;
      }

      toast.success(`Trilha "${formData.title}" adicionada com sucesso!`);
      await fetchTrails();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar trilha:", error);
      toast.error("Erro ao adicionar trilha");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inscrever-se em um curso
  const enrollInCourse = async (courseId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para se inscrever em cursos");
      return false;
    }

    try {
      const { error } = await supabase.from("course_enrollments").insert({
        user_id: user.id,
        course_id: courseId,
        progress: 0,
      });

      if (error) {
        if (error.code === "23505") {
          toast.info("Você já está inscrito neste curso");
        } else {
          toast.error("Erro ao se inscrever no curso");
        }
        return false;
      }

      toast.success("Inscrição realizada com sucesso!");
      await fetchCourses();
      return true;
    } catch (error) {
      console.error("Erro ao se inscrever:", error);
      toast.error("Erro ao se inscrever no curso");
      return false;
    }
  };

  // Inscrever-se em uma trilha
  const enrollInTrail = async (trailId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Você precisa estar logado para se inscrever em trilhas");
      return false;
    }

    try {
      const { error } = await supabase.from("trail_enrollments").insert({
        user_id: user.id,
        trail_id: trailId,
        progress: 0,
      });

      if (error) {
        if (error.code === "23505") {
          toast.info("Você já está inscrito nesta trilha");
        } else {
          toast.error("Erro ao se inscrever na trilha");
        }
        return false;
      }

      toast.success("Inscrição realizada com sucesso!");
      await fetchTrails();
      return true;
    } catch (error) {
      console.error("Erro ao se inscrever:", error);
      toast.error("Erro ao se inscrever na trilha");
      return false;
    }
  };

  // Estatísticas
  const stats = {
    totalCourses: courses.length,
    totalTrails: trails.length,
    inProgress: enrolledCourses.filter((c) => c.progress !== undefined && c.progress < 100).length,
    completed: enrolledCourses.filter((c) => c.progress === 100).length,
  };

  return {
    courses,
    trails,
    enrolledCourses,
    isLoading,
    isSubmitting,
    stats,
    addCourse,
    addTrail,
    enrollInCourse,
    enrollInTrail,
    refetchCourses: fetchCourses,
    refetchTrails: fetchTrails,
  };
};
