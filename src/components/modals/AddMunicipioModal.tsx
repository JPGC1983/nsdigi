import { useState } from "react";
import { MapPin } from "lucide-react";
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

interface AddMunicipioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (data: MunicipioData) => void;
}

export interface MunicipioData {
  name: string;
  population: number;
  coordinator: string;
  email: string;
  phone: string;
  status: "ativo" | "em_implantacao" | "pendente";
}

const AddMunicipioModal = ({ open, onOpenChange, onAdd }: AddMunicipioModalProps) => {
  const [formData, setFormData] = useState<MunicipioData>({
    name: "",
    population: 0,
    coordinator: "",
    email: "",
    phone: "",
    status: "pendente",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.coordinator) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    onAdd?.(formData);
    toast.success(`Município "${formData.name}" adicionado com sucesso!`);
    setFormData({
      name: "",
      population: 0,
      coordinator: "",
      email: "",
      phone: "",
      status: "pendente",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Adicionar Município</DialogTitle>
              <DialogDescription>
                Cadastre um novo município da microrregião
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome do Município *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: São Paulo"
              />
            </div>
            <div>
              <Label htmlFor="population">População</Label>
              <Input
                id="population"
                type="number"
                value={formData.population || ""}
                onChange={(e) => setFormData({ ...formData, population: Number(e.target.value) })}
                placeholder="Ex: 50000"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "ativo" | "em_implantacao" | "pendente") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_implantacao">Em Implantação</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="coordinator">Coordenador *</Label>
              <Input
                id="coordinator"
                value={formData.coordinator}
                onChange={(e) => setFormData({ ...formData, coordinator: e.target.value })}
                placeholder="Nome do coordenador"
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
            <Button type="submit">Adicionar Município</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMunicipioModal;
