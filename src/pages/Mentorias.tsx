import { useState } from "react";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  Award,
  Search,
  Filter,
  Plus,
  UserPlus,
  BookOpen
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MentorCard from "@/components/mentorship/MentorCard";
import JourneyProgress from "@/components/mentorship/JourneyProgress";
import SessionCard from "@/components/mentorship/SessionCard";
import GoalCard from "@/components/mentorship/GoalCard";
import BadgeDisplay from "@/components/mentorship/BadgeDisplay";
import SpecialtyBadge from "@/components/mentorship/SpecialtyBadge";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { 
  useMentors, 
  useMentorProfile, 
  useMenteeProfile,
  useMentorshipMatches 
} from "@/hooks/useMentorship";
import { 
  SPECIALTY_CONFIG, 
  MentorshipSpecialty,
  Mentor,
  MentorshipMatch 
} from "@/types/mentorship";
import BecomeMentorModal from "@/components/modals/BecomeMentorModal";
import BecomeMenteeModal from "@/components/modals/BecomeMenteeModal";
import RequestMentorshipModal from "@/components/modals/RequestMentorshipModal";
import MentorProfileModal from "@/components/modals/MentorProfileModal";

const Mentorias = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [municipalityFilter, setMunicipalityFilter] = useState<string>("all");
  
  // Modals
  const [showBecomeMentor, setShowBecomeMentor] = useState(false);
  const [showBecomeMentee, setShowBecomeMentee] = useState(false);
  const [showRequestMentorship, setShowRequestMentorship] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showMentorProfile, setShowMentorProfile] = useState(false);

  // Data hooks
  const { mentors, loading: loadingMentors } = useMentors({
    specialty: specialtyFilter !== "all" ? specialtyFilter as MentorshipSpecialty : undefined,
  });
  const { mentor: myMentorProfile, loading: loadingMentorProfile } = useMentorProfile();
  const { mentee: myMenteeProfile, loading: loadingMenteeProfile } = useMenteeProfile();
  const { matches, loading: loadingMatches } = useMentorshipMatches();

  // Filter mentors
  const filteredMentors = mentors.filter((mentor) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = mentor.profile?.full_name?.toLowerCase().includes(query);
      const bioMatch = mentor.bio?.toLowerCase().includes(query);
      if (!nameMatch && !bioMatch) return false;
    }
    if (municipalityFilter !== "all" && mentor.municipality !== municipalityFilter) {
      return false;
    }
    return true;
  });

  // Get unique municipalities for filter
  const municipalities = [...new Set(mentors.map(m => m.municipality).filter(Boolean))];

  // Get active matches
  const activeMatches = matches.filter(m => m.status === "active");
  const pendingMatches = matches.filter(m => m.status === "pending");

  const handleRequestMentorship = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowRequestMentorship(true);
  };

  const handleViewMentorProfile = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowMentorProfile(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Mentorias</h1>
            <p className="text-muted-foreground">
              Conecte-se com especialistas e desenvolva suas habilidades
            </p>
          </div>
          <div className="flex gap-2">
            {!myMentorProfile && (
              <Button variant="outline" onClick={() => setShowBecomeMentor(true)}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Tornar-se Mentor
              </Button>
            )}
            {!myMenteeProfile && (
              <Button onClick={() => setShowBecomeMentee(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Buscar Mentor
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mentors.length}</p>
                  <p className="text-sm text-muted-foreground">Mentores Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeMatches.length}</p>
                  <p className="text-sm text-muted-foreground">Mentorias Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {matches.reduce((acc, m) => acc + (m.sessions?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Sessões Realizadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Object.keys(SPECIALTY_CONFIG).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Especialidades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="directory" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Diretório de Mentores
            </TabsTrigger>
            <TabsTrigger value="my-mentorships" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Minhas Mentorias
              {pendingMatches.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingMatches.length}
                </Badge>
              )}
            </TabsTrigger>
            {myMentorProfile && (
              <TabsTrigger value="mentor-dashboard" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Painel do Mentor
              </TabsTrigger>
            )}
          </TabsList>

          {/* Directory Tab */}
          <TabsContent value="directory" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar mentores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Especialidades</SelectItem>
                  {Object.entries(SPECIALTY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.icon} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={municipalityFilter} onValueChange={setMunicipalityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Município" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Municípios</SelectItem>
                  {municipalities.map((mun) => (
                    <SelectItem key={mun} value={mun!}>
                      {mun}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mentors Grid */}
            {loadingMentors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-80 animate-pulse bg-muted" />
                ))}
              </div>
            ) : filteredMentors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onRequestMentorship={() => handleRequestMentorship(mentor)}
                    onViewProfile={() => handleViewMentorProfile(mentor)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Nenhum mentor encontrado"
                description="Tente ajustar os filtros ou volte mais tarde"
              />
            )}
          </TabsContent>

          {/* My Mentorships Tab */}
          <TabsContent value="my-mentorships" className="space-y-6">
            {!myMenteeProfile ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Comece sua jornada de mentoria
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    Cadastre-se como mentorado para encontrar um mentor especializado
                    e desenvolver suas habilidades em saúde digital.
                  </p>
                  <Button onClick={() => setShowBecomeMentee(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Buscar um Mentor
                  </Button>
                </CardContent>
              </Card>
            ) : activeMatches.length > 0 ? (
              <div className="space-y-6">
                {activeMatches.map((match) => (
                  <MentorshipMatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Nenhuma mentoria ativa"
                description="Busque um mentor no diretório para começar"
                actionLabel="Explorar Mentores"
                onAction={() => setActiveTab("directory")}
              />
            )}

            {/* Pending Requests */}
            {pendingMatches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {pendingMatches.length}
                    </Badge>
                    Solicitações Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingMatches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {match.mentor?.profile?.full_name?.charAt(0) || "M"}
                          </div>
                          <div>
                            <p className="font-medium">
                              {match.mentor?.profile?.full_name || "Mentor"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Aguardando confirmação
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Pendente</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Mentor Dashboard Tab */}
          {myMentorProfile && (
            <TabsContent value="mentor-dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mentor Stats */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Suas Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">
                          {myMentorProfile.current_mentees}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Mentorados Ativos
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">
                          {myMentorProfile.total_sessions}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Sessões Realizadas
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">
                          {myMentorProfile.total_hours.toFixed(1)}h
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Horas de Mentoria
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold flex items-center justify-center gap-1">
                          ⭐ {myMentorProfile.avg_rating.toFixed(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avaliação Média
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Specialties */}
                <Card>
                  <CardHeader>
                    <CardTitle>Suas Especialidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {myMentorProfile.specialties?.map((spec) => (
                        <SpecialtyBadge key={spec} specialty={spec} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mentees List */}
              <Card>
                <CardHeader>
                  <CardTitle>Seus Mentorados</CardTitle>
                </CardHeader>
                <CardContent>
                  {matches.filter(m => m.status === "active").length > 0 ? (
                    <div className="space-y-4">
                      {matches
                        .filter(m => m.status === "active")
                        .map((match) => (
                          <div
                            key={match.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                                {match.mentee?.profile?.full_name?.charAt(0) || "M"}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {match.mentee?.profile?.full_name || "Mentorado"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {match.mentee?.organization}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <JourneyProgress
                                currentPhase={match.current_phase}
                                phaseProgress={match.phase_progress}
                                compact
                              />
                              <Button variant="outline" size="sm">
                                Ver Detalhes
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Users}
                      title="Nenhum mentorado ativo"
                      description="Aguarde solicitações de mentoria"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modals */}
      <BecomeMentorModal
        open={showBecomeMentor}
        onOpenChange={setShowBecomeMentor}
      />
      <BecomeMenteeModal
        open={showBecomeMentee}
        onOpenChange={setShowBecomeMentee}
      />
      {selectedMentor && (
        <>
          <RequestMentorshipModal
            open={showRequestMentorship}
            onOpenChange={setShowRequestMentorship}
            mentor={selectedMentor}
          />
          <MentorProfileModal
            open={showMentorProfile}
            onOpenChange={setShowMentorProfile}
            mentor={selectedMentor}
          />
        </>
      )}
    </MainLayout>
  );
};

// Component for active mentorship match
const MentorshipMatchCard = ({ match }: { match: MentorshipMatch }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold">
              {match.mentor?.profile?.full_name?.charAt(0) || "M"}
            </div>
            <div>
              <CardTitle className="text-lg">
                Mentoria com {match.mentor?.profile?.full_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {match.mentor?.profile?.job_title} • {match.mentor?.organization}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ativa
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Journey Progress */}
          <div>
            <h4 className="font-medium mb-4">Progresso da Jornada</h4>
            <JourneyProgress
              currentPhase={match.current_phase}
              phaseProgress={match.phase_progress}
            />
          </div>

          {/* Goals */}
          <div>
            <h4 className="font-medium mb-4">
              Metas ({match.goals_list?.filter(g => g.status === "completed").length || 0}/
              {match.goals_list?.length || 0})
            </h4>
            <div className="space-y-3">
              {match.goals_list?.slice(0, 3).map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
              {(match.goals_list?.length || 0) > 3 && (
                <Button variant="ghost" className="w-full">
                  Ver todas as metas
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Next Session */}
        {match.sessions && match.sessions.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-4">Próxima Sessão</h4>
            <SessionCard
              session={match.sessions.find(s => s.status === "confirmed") || match.sessions[0]}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Mentorias;
