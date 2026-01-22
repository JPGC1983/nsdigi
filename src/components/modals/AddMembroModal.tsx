import { useState } from "react";
import { UserPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AddMembroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (data: MembroData) => void;
}

export interface MembroData {
  name: string;
  role: string;
  municipality: string;
  email: string;
  phone: string;
  category: "obrigatorio" | "recomendado";
}

const roles = [
  { value: "coordenador", label: "Coordenador do Núcleo" },
  { value: "ponto_focal", label: "Ponto Focal Municipal" },
  { value: "aps", label: "Representante APS" },
  { value: "regulacao", label: "Representante Regulação" },
  { value: "ti", label: "Representante TI" },
  { value: "ses", label: "Representante SES-MG" },
  { value: "educacao", label: "Educação Permanente" },
  { value: "vigilancia", label: "Vigilância em Saúde" },
];

const AddMembroModal = ({ open, onOpenChange, onAdd }: AddMembroModalProps) => {
  const [formData, setFormData] = useState<MembroData>({
    name: "",
    role: "",
    municipality: "",
    email: "",
    phone: "",
    category: "obrigatorio",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    onAdd?.(formData);
    toast.success(`Membro "${formData.name}" adicionado com sucesso!`);
    setFormData({
      name: "",
      role: "",
      municipality: "",
      email: "",
      phone: "",
      category: "obrigatorio",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Adicionar Membro</DialogTitle>
              <DialogDescription>
                Adicione um membro ao colegiado
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do membro"
              />
            </div>
            <div>
              <Label htmlFor="role">Função *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Tipo de Representação</Label>
              <Select
                value={formData.category}
                onValueChange={(value: "obrigatorio" | "recomendado") =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="obrigatorio">Obrigatória</SelectItem>
                  <SelectItem value="recomendado">Recomendada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="municipality">Município</Label>
              <Input
                id="municipality"
                value={formData.municipality}
                onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                placeholder="Município de origem"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar Membro</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMembroModal;
