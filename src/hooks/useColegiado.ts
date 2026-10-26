import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useContentScope } from "@/hooks/useContentScope";
import { toast } from "sonner";

export interface ColegiadoMember {
  id: string;
  nome: string;
  funcao: string;
  municipio: string | null;
  categoria: "obrigatorio" | "recomendado";
  email?: string | null;
  telefone?: string | null;
}

export interface ColegiadoMeeting {
  id: string;
  titulo: string;
  data_reuniao: string;
  horario: string | null;
  formato: "presencial" | "virtual" | "hibrida";
  local: string | null;
  descricao: string | null;
}

const MEMBER_COLUMNS = "id, nome, funcao, municipio, categoria";

/** Membros e reuniões do colegiado, gravados no banco e limitados ao território do usuário. */
export const useColegiado = () => {
  const { user } = useAuth();
  const { getScopeFields } = useContentScope();
  const [members, setMembers] = useState<ColegiadoMember[]>([]);
  const [meetings, setMeetings] = useState<ColegiadoMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setMembers([]);
      setMeetings([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const [membersRes, contactsRes, meetingsRes] = await Promise.all([
      supabase.from("colegiado_members").select(MEMBER_COLUMNS).order("nome"),
      supabase.rpc("list_colegiado_contacts"),
      supabase
        .from("colegiado_meetings")
        .select("id, titulo, data_reuniao, horario, formato, local, descricao")
        .gte("data_reuniao", today)
        .order("data_reuniao"),
    ]);
    const contacts = new Map((contactsRes.data ?? []).map((c) => [c.id, c]));
    setMembers(
      ((membersRes.data ?? []) as ColegiadoMember[]).map((m) => ({
        ...m,
        email: contacts.get(m.id)?.email ?? null,
        telefone: contacts.get(m.id)?.telefone ?? null,
      })),
    );
    setMeetings((meetingsRes.data ?? []) as ColegiadoMeeting[]);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addMember = async (data: {
    nome: string;
    funcao: string;
    municipio?: string;
    categoria: "obrigatorio" | "recomendado";
    email?: string;
    telefone?: string;
  }) => {
    if (!user) return false;
    const { error } = await supabase.from("colegiado_members").insert({
      nome: data.nome,
      funcao: data.funcao,
      municipio: data.municipio || null,
      categoria: data.categoria,
      email: data.email || null,
      telefone: data.telefone || null,
      created_by: user.id,
      ...getScopeFields(),
    });
    if (error) {
      toast.error(
        error.code === "42501"
          ? "Você não tem permissão para cadastrar membros neste território."
          : "Não foi possível salvar o membro. Tente novamente.",
      );
      return false;
    }
    toast.success(`${data.nome} foi adicionado ao colegiado.`);
    await load();
    return true;
  };

  const addMeeting = async (data: {
    titulo: string;
    data_reuniao: string;
    horario?: string;
    formato: "presencial" | "virtual" | "hibrida";
    local?: string;
    descricao?: string;
  }) => {
    if (!user) return false;
    const { error } = await supabase.from("colegiado_meetings").insert({
      titulo: data.titulo,
      data_reuniao: data.data_reuniao,
      horario: data.horario || null,
      formato: data.formato,
      local: data.local || null,
      descricao: data.descricao || null,
      created_by: user.id,
      ...getScopeFields(),
    });
    if (error) {
      toast.error(
        error.code === "42501"
          ? "Você não tem permissão para agendar reuniões neste território."
          : "Não foi possível agendar a reunião. Tente novamente.",
      );
      return false;
    }
    toast.success("Reunião agendada.");
    await load();
    return true;
  };

  return { members, meetings, isLoading, addMember, addMeeting, reload: load };
};
