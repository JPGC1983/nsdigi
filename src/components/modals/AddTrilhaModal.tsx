import { useState } from "react";
import { BookOpen } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";

export interface TrilhaData {
  title: string;
  description: string;
  category: string;
  totalHours: number;
  level: "basico" | "intermediario" | "avancado";
}

interface AddTrilhaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: TrilhaData) => Promise<boolean>;
}

const categories = [
  "e-SUS",
  "RNDS",
  "Telessaúde",
  "Gestão",
  "Segurança",
  "Interoperabilidade",
];

const AddTrilhaModal = ({ open, onOpenChange, onAdd }: AddTrilhaModalProps) => {
  const [formData, setFormData] = useState<TrilhaData>({
    title: "",
    description: "",
    category: "",
    totalHours: 0,
    level: "basico",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Informe o título da trilha formativa.",
        variant: "destructive",
      });
      return;
    }

    const success = await onAdd(formData);
    if (success) {
      setFormData({
        title: "",
        description: "",
        category: "",
        totalHours: 0,
        level: "basico",
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Criar Nova Trilha Formativa
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para criar uma nova trilha de formação.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Título da Trilha *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Fundamentos do e-SUS"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Nível</Label>
              <Select
                value={formData.level}
                onValueChange={(value: "basico" | "intermediario" | "avancado") =>
                  setFormData({ ...formData, level: value })
                }
              >
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="totalHours">Carga Horária Total (horas)</Label>
              <Input
                id="totalHours"
                type="number"
                min="0"
                value={formData.totalHours || ""}
                onChange={(e) => setFormData({ ...formData, totalHours: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 40"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva os objetivos e conteúdos desta trilha formativa..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Trilha</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrilhaModal;
