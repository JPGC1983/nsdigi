import { useState } from "react";
import { GraduationCap } from "lucide-react";
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

interface AddCursoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (data: CursoData) => void;
}

export interface CursoData {
  title: string;
  description: string;
  category: string;
  duration: string;
  level: "basico" | "intermediario" | "avancado";
  format: "online" | "presencial" | "hibrido";
}

const categories = [
  { value: "e-SUS", label: "e-SUS" },
  { value: "RNDS", label: "RNDS" },
  { value: "Telessaúde", label: "Telessaúde" },
  { value: "Gestão", label: "Gestão" },
  { value: "Segurança", label: "Segurança" },
];

const AddCursoModal = ({ open, onOpenChange, onAdd }: AddCursoModalProps) => {
  const [formData, setFormData] = useState<CursoData>({
    title: "",
    description: "",
    category: "",
    duration: "",
    level: "basico",
    format: "online",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    onAdd?.(formData);
    toast.success(`Curso "${formData.title}" adicionado com sucesso!`);
    setFormData({
      title: "",
      description: "",
      category: "",
      duration: "",
      level: "basico",
      format: "online",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Adicionar Curso</DialogTitle>
              <DialogDescription>
                Cadastre um novo curso ou formação
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Título do Curso *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Introdução ao e-SUS"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
              <Label htmlFor="duration">Duração</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Ex: 4h"
              />
            </div>
            <div>
              <Label htmlFor="level">Nível</Label>
              <Select
                value={formData.level}
                onValueChange={(value: "basico" | "intermediario" | "avancado") =>
                  setFormData({ ...formData, level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="format">Formato</Label>
              <Select
                value={formData.format}
                onValueChange={(value: "online" | "presencial" | "hibrido") =>
                  setFormData({ ...formData, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o conteúdo do curso..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar Curso</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCursoModal;
