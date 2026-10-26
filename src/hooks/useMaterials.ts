import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useContentScope } from "@/hooks/useContentScope";
import type { MaterialData } from "@/components/modals/AddMaterialModal";
import { toast } from "sonner";

export type MaterialType = "video" | "manual" | "faq" | "template" | "legislacao";

export interface Material {
  id: string;
  title: string;
  description: string | null;
  material_type: MaterialType;
  category: string | null;
  author: string | null;
  url: string | null;
  file_path: string | null;
  file_name: string | null;
  downloads: number;
  updated_at: string;
}

const BUCKET = "materiais";

/** Materiais do repositório: lidos do banco dentro do território; arquivos em armazenamento privado. */
export const useMaterials = () => {
  const { user } = useAuth();
  const { getScopeFields } = useContentScope();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setMaterials([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(false);
    const { data, error } = await supabase
      .from("materials")
      .select("id, title, description, material_type, category, author, url, file_path, file_name, downloads, updated_at")
      .order("created_at", { ascending: false });
    if (error) setLoadError(true);
    setMaterials((data ?? []) as Material[]);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addMaterial = async (data: MaterialData): Promise<boolean> => {
    if (!user) return false;
    let file_path: string | null = null;
    if (data.file) {
      const ext = data.file.name.split(".").pop() || "bin";
      file_path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(file_path, data.file);
      if (upErr) {
        toast.error("Não foi possível enviar o arquivo. Tente novamente.");
        return false;
      }
    }
    const { error } = await supabase.from("materials").insert({
      title: data.title.trim(),
      description: data.description || null,
      material_type: data.type,
      category: data.category || null,
      author: data.author || null,
      url: file_path ? null : data.url.trim() || null,
      file_path,
      file_name: data.file?.name ?? null,
      file_size: data.file?.size ?? null,
      file_type: data.file?.type || null,
      created_by: user.id,
      ...getScopeFields(),
    });
    if (error) {
      if (file_path) await supabase.storage.from(BUCKET).remove([file_path]);
      toast.error(
        error.code === "42501"
          ? "Você não tem permissão para publicar materiais neste território."
          : "Não foi possível salvar o material. Tente novamente.",
      );
      return false;
    }
    toast.success(`Material "${data.title}" publicado.`);
    await load();
    return true;
  };

  /** Abre o material (link externo ou arquivo privado por link temporário) e conta o acesso. */
  const openMaterial = async (m: Material, countDownload: boolean) => {
    let href = m.url;
    if (m.file_path) {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(m.file_path, 60 * 10, countDownload ? { download: m.file_name ?? true } : undefined);
      if (error || !data) {
        toast.error("Não foi possível abrir o arquivo.");
        return;
      }
      href = data.signedUrl;
    }
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
    if (countDownload) {
      await supabase.rpc("register_material_download", { _material_id: m.id });
      setMaterials((prev) => prev.map((x) => (x.id === m.id ? { ...x, downloads: x.downloads + 1 } : x)));
    }
  };

  return { materials, isLoading, loadError, addMaterial, openMaterial, reload: load };
};
