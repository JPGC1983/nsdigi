import { useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddForumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (data: ForumData) => void;
}

const categoryStyle: Record<string, { icon: string; color: string }> = {
  aps: { icon: "🏥", color: "#1e6b4a" },
  regulacao: { icon: "🔀", color: "#0369a1" },
  gestao: { icon: "📊", color: "#7c3aed" },
  ti: { icon: "🛡️", color: "#b45309" },
  inovacao: { icon: "💡", color: "#0891b2" },
};

const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export interface ForumData {
  name: string;
  description: string;
  category: string;
}

const categories = [
  { value: "aps", label: "Atenção Primária à Saúde" },
  { value: "regulacao", label: "Regulação" },
  { value: "gestao", label: "Gestão em Saúde" },
  { value: "ti", label: "Tecnologia da Informação" },
  { value: "inovacao", label: "Inovação" },
];

const AddForumModal = ({ open, onOpenChange, onAdd }: AddForumModalProps) => {
  const [formData, setFormData] = useState<ForumData>({
    name: "",
    description: "",
    category: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const style = categoryStyle[formData.category] ?? categoryStyle.aps;
    setIsSaving(true);
    const { error } = await supabase.from("forums").insert({
      name: formData.name.trim(),
      slug: `${slugify(formData.name)}-${Date.now().toString(36)}`,
      description: formData.description.trim() || formData.name.trim(),
      icon: style.icon,
      color: style.color,
    });
    setIsSaving(false);

    if (error) {
      toast.error("Não foi possível criar o fórum. Verifique se você tem permissão de administrador.");
      return;
    }

    onAdd?.(formData);
    toast.success(`Fórum "${formData.name}" criado com sucesso!`);
    setFormData({ name: "", description: "", category: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Criar Novo Fórum</DialogTitle>
              <DialogDescription>
                Crie um fórum temático para discussões
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Fórum *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Boas práticas no e-SUS"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o objetivo deste fórum..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Criando..." : "Criar Fórum"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddForumModal;
