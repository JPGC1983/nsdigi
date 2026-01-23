import { useState } from "react";
import {
  Dialog,
  DialogContent,
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
import { Calendar, Loader2 } from "lucide-react";

export interface CibMeetingData {
  meeting_date: string;
  themes: string;
  deliberations: string;
  territory_impacts: string;
  participation_type: string;
  participants: string;
  notes: string;
}

interface AddCibMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: CibMeetingData) => Promise<void>;
}

const AddCibMeetingModal = ({
  open,
  onOpenChange,
  onAdd,
}: AddCibMeetingModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CibMeetingData>({
    meeting_date: "",
    themes: "",
    deliberations: "",
    territory_impacts: "",
    participation_type: "presencial",
    participants: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd(formData);
      setFormData({
        meeting_date: "",
        themes: "",
        deliberations: "",
        territory_impacts: "",
        participation_type: "presencial",
        participants: "",
        notes: "",
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Registrar Reunião da CIB
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meeting_date">Data da Reunião *</Label>
              <Input
                id="meeting_date"
                type="date"
                value={formData.meeting_date}
                onChange={(e) =>
                  setFormData({ ...formData, meeting_date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participation_type">Tipo de Participação *</Label>
              <Select
                value={formData.participation_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, participation_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hibrida">Híbrida</SelectItem>
                  <SelectItem value="acompanhamento">Acompanhamento (pauta/deliberações)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="themes">Principais Temas Discutidos *</Label>
            <Textarea
              id="themes"
              value={formData.themes}
              onChange={(e) =>
                setFormData({ ...formData, themes: e.target.value })
              }
              placeholder="Liste os principais temas da pauta e discussões realizadas..."
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliberations">Deliberações e Pactuações</Label>
            <Textarea
              id="deliberations"
              value={formData.deliberations}
              onChange={(e) =>
                setFormData({ ...formData, deliberations: e.target.value })
              }
              placeholder="Quais foram as principais decisões e pactuações aprovadas..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="territory_impacts">
              Impactos para o Território
            </Label>
            <Textarea
              id="territory_impacts"
              value={formData.territory_impacts}
              onChange={(e) =>
                setFormData({ ...formData, territory_impacts: e.target.value })
              }
              placeholder="Como as decisões afetam o planejamento e a organização da rede de saúde local..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="participants">Participantes da Equipe</Label>
            <Input
              id="participants"
              value={formData.participants}
              onChange={(e) =>
                setFormData({ ...formData, participants: e.target.value })
              }
              placeholder="Nomes dos membros da equipe que participaram"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações Adicionais</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Outras informações relevantes..."
              className="min-h-[60px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Registrar Reunião"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCibMeetingModal;
