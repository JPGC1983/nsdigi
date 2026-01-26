import { Star, MapPin, Clock, Users, CheckCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mentor, SPECIALTY_CONFIG, DAY_OF_WEEK_LABELS } from "@/types/mentorship";

interface MentorCardProps {
  mentor: Mentor;
  matchScore?: number;
  matchedSpecialties?: string[];
  onRequestMentorship?: () => void;
  onViewProfile?: () => void;
}

const MentorCard = ({
  mentor,
  matchScore,
  matchedSpecialties,
  onRequestMentorship,
  onViewProfile,
}: MentorCardProps) => {
  const hasCapacity = mentor.current_mentees < mentor.max_mentees;
  
  const availableDays = mentor.availability
    ?.filter(a => a.is_active)
    .map(a => DAY_OF_WEEK_LABELS[a.day_of_week].slice(0, 3))
    .filter((v, i, a) => a.indexOf(v) === i) || [];

  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
      {matchScore !== undefined && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              Compatibilidade: {Math.round(matchScore)}%
            </span>
            {matchedSpecialties && matchedSpecialties.length > 0 && (
              <div className="flex gap-1">
                {matchedSpecialties.slice(0, 2).map((spec) => {
                  const config = SPECIALTY_CONFIG[spec as keyof typeof SPECIALTY_CONFIG];
                  return config ? (
                    <span key={spec} className="text-xs">
                      {config.icon}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={mentor.profile?.avatar_url || undefined} />
            <AvatarFallback className="text-lg font-semibold bg-primary/10">
              {mentor.profile?.full_name?.charAt(0) || "M"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">
                {mentor.profile?.full_name || "Mentor"}
              </h3>
              {mentor.is_verified && (
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>

            {mentor.profile?.job_title && (
              <p className="text-sm text-muted-foreground truncate">
                {mentor.profile.job_title}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
              {mentor.municipality && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {mentor.municipality}
                </span>
              )}
              {mentor.years_experience > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {mentor.years_experience} anos
                </span>
              )}
            </div>
          </div>
        </div>

        {mentor.bio && (
          <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
            {mentor.bio}
          </p>
        )}

        {/* Specialties */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {mentor.specialties?.slice(0, 4).map((specialty) => {
            const config = SPECIALTY_CONFIG[specialty];
            if (!config) return null;
            return (
              <Badge
                key={specialty}
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: config.bgColor,
                  color: config.color,
                }}
              >
                {config.icon} {config.label}
              </Badge>
            );
          })}
          {mentor.specialties?.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{mentor.specialties.length - 4}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold">
                {mentor.avg_rating > 0 ? mentor.avg_rating.toFixed(1) : "-"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mentor.rating_count} avaliações
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary">
              <Users className="h-4 w-4" />
              <span className="font-semibold">
                {mentor.current_mentees}/{mentor.max_mentees}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">mentorados</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold">{mentor.total_sessions}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">sessões</p>
          </div>
        </div>

        {/* Availability */}
        {availableDays.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Disponível: {availableDays.join(", ")}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onViewProfile}
        >
          Ver Perfil
        </Button>
        <Button
          className="flex-1"
          disabled={!hasCapacity}
          onClick={onRequestMentorship}
        >
          {hasCapacity ? "Solicitar Mentoria" : "Sem Vagas"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MentorCard;
