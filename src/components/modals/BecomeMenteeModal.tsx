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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMenteeProfile } from "@/hooks/useMentorship";
import { SPECIALTY_CONFIG, MentorshipSpecialty } from "@/types/mentorship";

interface BecomeMenteeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BecomeMenteeModal = ({ open, onOpenChange }: BecomeMenteeModalProps) => {
  const { createMenteeProfile } = useMenteeProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    municipality: "",
    organization: "",
    job_role: "",
    experience_level: "beginner",
    learning_goals: "",
    knowledge_gaps: [] as MentorshipSpecialty[],
    preferred_schedule: "",
  });

  const handleGapToggle = (gap: MentorshipSpecialty) => {
    if (formData.knowledge_gaps.includes(gap)) {
      setFormData({
        ...formData,
        knowledge_gaps: formData.knowledge_gaps.filter((g) => g !== gap),
      });
    } else {
      setFormData({
        ...formData,
        knowledge_gaps: [...formData.knowledge_gaps, gap],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.knowledge_gaps.length === 0) {
      toast.error("Selecione pelo menos uma área de interesse");
      return;
    }

    try {
      setLoading(true);
      await createMenteeProfile(formData);
      toast.success("Perfil criado! Agora você pode buscar um mentor.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Erro ao criar perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Buscar um Mentor</DialogTitle>
              <DialogDescription>
                Cadastre-se para encontrar o mentor ideal para você
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Job Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="municipality">Município</Label>
              <Input
                id="municipality"
                value={formData.municipality}
                onChange={(e) =>
                  setFormData({ ...formData, municipality: e.target.value })
                }
                placeholder="Ex: Belo Horizonte"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organização</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) =>
                  setFormData({ ...formData, organization: e.target.value })
                }
                placeholder="Ex: UBS Centro"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_role">Cargo/Função</Label>
              <Input
                id="job_role"
                value={formData.job_role}
                onChange={(e) =>
                  setFormData({ ...formData, job_role: e.target.value })
                }
                placeholder="Ex: Enfermeiro(a)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Nível de Experiência</Label>
              <Select
                value={formData.experience_level}
                onValueChange={(value) =>
                  setFormData({ ...formData, experience_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Knowledge Gaps */}
          <div className="space-y-3">
            <Label>Áreas que deseja desenvolver *</Label>
            <p className="text-sm text-muted-foreground">
              Selecione os temas em que você precisa de orientação
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(SPECIALTY_CONFIG).map(([key, config]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.knowledge_gaps.includes(key as MentorshipSpecialty)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={formData.knowledge_gaps.includes(key as MentorshipSpecialty)}
                    onCheckedChange={() => handleGapToggle(key as MentorshipSpecialty)}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {config.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <Label htmlFor="goals">Objetivos de Aprendizado</Label>
            <Textarea
              id="goals"
              value={formData.learning_goals}
              onChange={(e) =>
                setFormData({ ...formData, learning_goals: e.target.value })
              }
              placeholder="O que você espera alcançar com a mentoria?"
              rows={3}
            />
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="schedule">Preferência de Horário</Label>
            <Input
              id="schedule"
              value={formData.preferred_schedule}
              onChange={(e) =>
                setFormData({ ...formData, preferred_schedule: e.target.value })
              }
              placeholder="Ex: Terças e quintas, período da tarde"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Perfil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BecomeMenteeModal;
