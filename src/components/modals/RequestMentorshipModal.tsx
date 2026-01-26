import { useState } from "react";
import { Users, CheckCircle, Star, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Mentor, SPECIALTY_CONFIG } from "@/types/mentorship";
import { useMenteeProfile, useMentorshipMatches } from "@/hooks/useMentorship";

interface RequestMentorshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor: Mentor;
}

const RequestMentorshipModal = ({
  open,
  onOpenChange,
  mentor,
}: RequestMentorshipModalProps) => {
  const { mentee } = useMenteeProfile();
  const { requestMatch } = useMentorshipMatches();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!mentee) {
      toast.error("Você precisa criar um perfil de mentorado primeiro");
      return;
    }

    try {
      setLoading(true);
      
      // Find common specialties
      const commonSpecialties = mentor.specialties?.filter(
        (s) => mentee.knowledge_gaps?.includes(s)
      ) || [];

      await requestMatch(mentor.id, mentee.id, commonSpecialties);
      
      toast.success("Solicitação enviada! Aguarde a resposta do mentor.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Erro ao enviar solicitação: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const commonSpecialties = mentor.specialties?.filter(
    (s) => mentee?.knowledge_gaps?.includes(s)
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Solicitar Mentoria</DialogTitle>
          <DialogDescription>
            Envie uma solicitação de mentoria para este especialista
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mentor Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-14 w-14">
              <AvatarImage src={mentor.profile?.avatar_url || undefined} />
              <AvatarFallback className="text-lg font-semibold">
                {mentor.profile?.full_name?.charAt(0) || "M"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {mentor.profile?.full_name || "Mentor"}
                </h3>
                {mentor.is_verified && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {mentor.profile?.job_title}
              </p>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                {mentor.municipality && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {mentor.municipality}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  {mentor.avg_rating > 0 ? mentor.avg_rating.toFixed(1) : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Common Specialties */}
          {commonSpecialties.length > 0 && (
            <div className="space-y-2">
              <Label>Especialidades em Comum</Label>
              <div className="flex flex-wrap gap-2">
                {commonSpecialties.map((spec) => {
                  const config = SPECIALTY_CONFIG[spec];
                  return (
                    <Badge
                      key={spec}
                      style={{
                        backgroundColor: config.bgColor,
                        color: config.color,
                      }}
                    >
                      {config.icon} {config.label}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Estas são as áreas que você quer desenvolver e o mentor domina
              </p>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Apresente-se brevemente e explique por que deseja essa mentoria..."
              rows={4}
            />
          </div>

          {/* Warning if no common specialties */}
          {commonSpecialties.length === 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ Este mentor não possui especialidades alinhadas com suas áreas
                de interesse. Considere atualizar seu perfil ou buscar outro mentor.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !mentee}
          >
            {loading ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestMentorshipModal;
