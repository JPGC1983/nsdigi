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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMentorProfile } from "@/hooks/useMentorship";
import { SPECIALTY_CONFIG, MentorshipSpecialty } from "@/types/mentorship";

interface BecomeMentorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BecomeMentorModal = ({ open, onOpenChange }: BecomeMentorModalProps) => {
  const { createMentorProfile } = useMentorProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    years_experience: 0,
    municipality: "",
    organization: "",
    specialties: [] as MentorshipSpecialty[],
    max_mentees: 3,
    linkedin_url: "",
    availability_notes: "",
  });

  const handleSpecialtyToggle = (specialty: MentorshipSpecialty) => {
    if (formData.specialties.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter((s) => s !== specialty),
      });
    } else {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.specialties.length === 0) {
      toast.error("Selecione pelo menos uma especialidade");
      return;
    }

    if (!formData.bio.trim()) {
      toast.error("Preencha sua biografia");
      return;
    }

    try {
      setLoading(true);
      await createMentorProfile(formData);
      toast.success("Perfil de mentor criado com sucesso!");
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
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Tornar-se Mentor</DialogTitle>
              <DialogDescription>
                Compartilhe seu conhecimento com outros profissionais
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Biografia *</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Conte sobre sua experiência e como você pode ajudar outros profissionais..."
              rows={4}
            />
          </div>

          {/* Experience & Municipality */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="years">Anos de Experiência</Label>
              <Input
                id="years"
                type="number"
                min={0}
                max={50}
                value={formData.years_experience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    years_experience: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_mentees">Máximo de Mentorados</Label>
              <Input
                id="max_mentees"
                type="number"
                min={1}
                max={10}
                value={formData.max_mentees}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_mentees: parseInt(e.target.value) || 3,
                  })
                }
              />
            </div>
          </div>

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
                placeholder="Ex: Secretaria de Saúde"
              />
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-3">
            <Label>Especialidades *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(SPECIALTY_CONFIG).map(([key, config]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.specialties.includes(key as MentorshipSpecialty)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={formData.specialties.includes(key as MentorshipSpecialty)}
                    onCheckedChange={() => handleSpecialtyToggle(key as MentorshipSpecialty)}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
            <Input
              id="linkedin"
              value={formData.linkedin_url}
              onChange={(e) =>
                setFormData({ ...formData, linkedin_url: e.target.value })
              }
              placeholder="https://linkedin.com/in/seu-perfil"
            />
          </div>

          {/* Availability Notes */}
          <div className="space-y-2">
            <Label htmlFor="availability">Notas de Disponibilidade</Label>
            <Textarea
              id="availability"
              value={formData.availability_notes}
              onChange={(e) =>
                setFormData({ ...formData, availability_notes: e.target.value })
              }
              placeholder="Ex: Disponível às terças e quintas, das 14h às 17h"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Perfil de Mentor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BecomeMentorModal;
