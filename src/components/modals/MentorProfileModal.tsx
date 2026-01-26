import {
  CheckCircle,
  Star,
  MapPin,
  Clock,
  Users,
  Calendar,
  Linkedin,
  Award,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mentor, SPECIALTY_CONFIG, DAY_OF_WEEK_LABELS } from "@/types/mentorship";

interface MentorProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor: Mentor;
  onRequestMentorship?: () => void;
}

const MentorProfileModal = ({
  open,
  onOpenChange,
  mentor,
  onRequestMentorship,
}: MentorProfileModalProps) => {
  const hasCapacity = mentor.current_mentees < mentor.max_mentees;
  
  const availableDays = mentor.availability
    ?.filter(a => a.is_active)
    .reduce((acc, slot) => {
      const dayName = DAY_OF_WEEK_LABELS[slot.day_of_week];
      if (!acc[dayName]) {
        acc[dayName] = [];
      }
      acc[dayName].push(`${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`);
      return acc;
    }, {} as Record<string, string[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil do Mentor</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/20">
              <AvatarImage src={mentor.profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl font-semibold bg-primary/10">
                {mentor.profile?.full_name?.charAt(0) || "M"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">
                  {mentor.profile?.full_name || "Mentor"}
                </h2>
                {mentor.is_verified && (
                  <Badge variant="outline" className="text-primary border-primary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
              </div>

              {mentor.profile?.job_title && (
                <p className="text-muted-foreground">
                  {mentor.profile.job_title}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                {mentor.municipality && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {mentor.municipality}
                  </span>
                )}
                {mentor.organization && (
                  <span>{mentor.organization}</span>
                )}
                {mentor.years_experience > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {mentor.years_experience} anos de experiência
                  </span>
                )}
              </div>

              {mentor.linkedin_url && (
                <a
                  href={mentor.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-xl font-bold">
                  {mentor.avg_rating > 0 ? mentor.avg_rating.toFixed(1) : "-"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mentor.rating_count} avaliações
              </p>
            </div>

            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-primary">
                <Users className="h-5 w-5" />
                <span className="text-xl font-bold">
                  {mentor.current_mentees}/{mentor.max_mentees}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">mentorados</p>
            </div>

            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-green-600">
                <Calendar className="h-5 w-5" />
                <span className="text-xl font-bold">{mentor.total_sessions}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">sessões</p>
            </div>

            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-purple-600">
                <Award className="h-5 w-5" />
                <span className="text-xl font-bold">
                  {mentor.total_hours.toFixed(0)}h
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">de mentoria</p>
            </div>
          </div>

          {/* Bio */}
          {mentor.bio && (
            <div>
              <h3 className="font-semibold mb-2">Sobre</h3>
              <p className="text-muted-foreground">{mentor.bio}</p>
            </div>
          )}

          {/* Specialties */}
          <div>
            <h3 className="font-semibold mb-2">Especialidades</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.specialties?.map((specialty) => {
                const config = SPECIALTY_CONFIG[specialty];
                if (!config) return null;
                return (
                  <Badge
                    key={specialty}
                    className="text-sm py-1.5 px-3"
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
          </div>

          {/* Availability */}
          {availableDays && Object.keys(availableDays).length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Disponibilidade</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(availableDays).map(([day, times]) => (
                  <div
                    key={day}
                    className="p-2 bg-muted/50 rounded-lg text-sm"
                  >
                    <p className="font-medium">{day}</p>
                    {times.map((time, i) => (
                      <p key={i} className="text-muted-foreground text-xs">
                        {time}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              {mentor.availability_notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  {mentor.availability_notes}
                </p>
              )}
            </div>
          )}

          {/* Action */}
          <div className="flex gap-3">
            <Button
              className="flex-1"
              disabled={!hasCapacity}
              onClick={() => {
                onOpenChange(false);
                onRequestMentorship?.();
              }}
            >
              {hasCapacity ? "Solicitar Mentoria" : "Sem Vagas Disponíveis"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MentorProfileModal;
