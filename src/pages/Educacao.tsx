import { useState } from "react";
import { GraduationCap, Clock, Users, BookOpen, Play, ChevronRight, Filter, Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddCursoModal from "@/components/modals/AddCursoModal";
import AddTrilhaModal, { TrilhaData } from "@/components/modals/AddTrilhaModal";
import { useEducacao, CourseFormData } from "@/hooks/useEducacao";
import { useAuth } from "@/hooks/useAuth";

const levelConfig = {
  basico: { label: "Básico", className: "bg-success/10 text-success border-success/20" },
  intermediario: { label: "Intermediário", className: "bg-warning/10 text-warning border-warning/20" },
  avancado: { label: "Avançado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const formatConfig = {
  online: { label: "Online", className: "bg-info/10 text-info" },
  presencial: { label: "Presencial", className: "bg-accent/10 text-accent" },
  hibrido: { label: "Híbrido", className: "bg-secondary/10 text-secondary" },
};

const Educacao = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("cursos");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrilhaModalOpen, setIsTrilhaModalOpen] = useState(false);

  const {
    courses,
    trails,
    enrolledCourses,
    isLoading,
    stats,
    addCourse,
    addTrail,
    enrollInCourse,
  } = useEducacao();

  const handleAddCurso = async (data: CourseFormData): Promise<boolean> => {
    return await addCourse(data);
  };

  const handleAddTrilha = async (data: TrilhaData): Promise<boolean> => {
    return await addTrail(data);
  };

  const filteredCourses = courses.filter((c) => {
    return categoryFilter === "all" || c.category === categoryFilter;
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Educação Permanente"
          description="Cursos, trilhas formativas e oficinas para qualificação em saúde digital"
          breadcrumbs={[{ label: "Educação Permanente" }]}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Cursos Disponíveis</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalCourses}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Trilhas Formativas</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalTrails}</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground">Em Andamento</p>
            <p className="text-2xl font-bold text-primary">{stats.inProgress}</p>
          </div>
          <div className="rounded-lg border border-success/20 bg-success/5 p-4">
            <p className="text-sm text-muted-foreground">Concluídos</p>
            <p className="text-2xl font-bold text-success">{stats.completed}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList>
              <TabsTrigger value="cursos">Cursos</TabsTrigger>
              <TabsTrigger value="trilhas">Trilhas</TabsTrigger>
              <TabsTrigger value="meus">Meus Cursos</TabsTrigger>
            </TabsList>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                <SelectItem value="e-SUS">e-SUS</SelectItem>
                <SelectItem value="RNDS">RNDS</SelectItem>
                <SelectItem value="Telessaúde">Telessaúde</SelectItem>
                <SelectItem value="Gestão">Gestão</SelectItem>
                <SelectItem value="Segurança">Segurança</SelectItem>
                <SelectItem value="Saúde Digital">Saúde Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="cursos" className="mt-4">
            {filteredCourses.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="Nenhum curso disponível"
                description="Após adicionar cursos, você acompanhará a progressão dos profissionais nas trilhas formativas e certificações emitidas."
                actionLabel={user ? "Adicionar Curso" : undefined}
                onAction={user ? () => setIsModalOpen(true) : undefined}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                      <div className="flex gap-2">
                        <Badge className={levelConfig[course.level].className}>
                          {levelConfig[course.level].label}
                        </Badge>
                        <Badge className={formatConfig[course.format].className}>
                          {formatConfig[course.format].label}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{course.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration || "A definir"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.enrolled} inscritos
                      </span>
                    </div>

                    {course.progress !== undefined ? (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Seu progresso</span>
                          <span className="font-medium text-foreground">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => course.url ? window.open(course.url, '_blank') : enrollInCourse(course.id)}
                      >
                        <Play className="h-4 w-4" />
                        {course.url ? "Acessar Curso" : "Iniciar Curso"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trilhas" className="mt-4">
            {trails.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Nenhuma trilha formativa disponível"
                description="Crie trilhas para organizar cursos em jornadas de aprendizado estruturadas para os profissionais."
                actionLabel={user ? "Criar Trilha" : undefined}
                onAction={user ? () => setIsTrilhaModalOpen(true) : undefined}
              />
            ) : (
              <div className="space-y-4">
                {trails.map((trail) => (
                  <div
                    key={trail.id}
                    className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-lg gradient-health flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {trail.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{trail.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            {trail.courses_count} cursos
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {trail.total_hours}h total
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {trail.enrolled} inscritos
                          </span>
                        </div>
                        {trail.progress !== undefined && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-medium text-foreground">{trail.progress}%</span>
                            </div>
                            <Progress value={trail.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="meus" className="mt-4">
            {enrolledCourses.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="Nenhum curso iniciado"
                description="Quando você se inscrever em cursos, eles aparecerão aqui para acompanhar seu progresso e certificados."
                actionLabel="Explorar Cursos"
                onAction={() => setActiveTab("cursos")}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-xl border border-border bg-card p-5 shadow-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                      <Badge className={levelConfig[course.level].className}>
                        {levelConfig[course.level].label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{course.title}</h3>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Seu progresso</span>
                        <span className="font-medium text-foreground">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddCursoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAdd={handleAddCurso}
      />

      <AddTrilhaModal
        open={isTrilhaModalOpen}
        onOpenChange={setIsTrilhaModalOpen}
        onAdd={handleAddTrilha}
      />
    </MainLayout>
  );
};

export default Educacao;
