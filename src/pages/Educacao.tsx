import { useState } from "react";
import { GraduationCap, Clock, Users, BookOpen, Play, Award, ChevronRight, Filter, Plus } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
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
import AddCursoModal, { CursoData } from "@/components/modals/AddCursoModal";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  enrolled: number;
  category: string;
  level: "basico" | "intermediario" | "avancado";
  format: "online" | "presencial" | "hibrido";
  progress?: number;
}

interface Trail {
  id: string;
  title: string;
  description: string;
  courses: number;
  totalHours: number;
  enrolled: number;
  progress?: number;
}

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
  const [activeTab, setActiveTab] = useState("cursos");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [trails] = useState<Trail[]>([]);

  const handleAddCurso = (data: CursoData) => {
    const newCourse: Course = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      duration: data.duration,
      enrolled: 0,
      category: data.category,
      level: data.level,
      format: data.format,
    };
    setCourses([...courses, newCourse]);
  };

  const filteredCourses = courses.filter((c) => {
    return categoryFilter === "all" || c.category === categoryFilter;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Educação Permanente</h1>
            <p className="text-muted-foreground">
              Cursos, trilhas formativas e oficinas para qualificação em saúde digital
            </p>
          </div>
          <Button className="gap-2">
            <Award className="h-4 w-4" />
            Meus Certificados
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Cursos Disponíveis</p>
            <p className="text-2xl font-bold text-foreground">{courses.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Trilhas Formativas</p>
            <p className="text-2xl font-bold text-foreground">{trails.length}</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground">Em Andamento</p>
            <p className="text-2xl font-bold text-primary">0</p>
          </div>
          <div className="rounded-lg border border-success/20 bg-success/5 p-4">
            <p className="text-sm text-muted-foreground">Concluídos</p>
            <p className="text-2xl font-bold text-success">0</p>
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
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="cursos" className="mt-4">
            {filteredCourses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <GraduationCap className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum curso disponível
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Os cursos e formações serão exibidos aqui quando forem cadastrados.
                </p>
                <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Adicionar Curso
                </Button>
              </div>
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
                      <Button variant="outline" className="w-full gap-2">
                        <Play className="h-4 w-4" />
                        Iniciar Curso
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trilhas" className="mt-4">
            {trails.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma trilha disponível
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  As trilhas formativas serão exibidas aqui quando forem cadastradas.
                </p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Trilha
                </Button>
              </div>
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
                            {trail.courses} cursos
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {trail.totalHours}h total
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
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <GraduationCap className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum curso iniciado</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Quando você se inscrever em cursos, eles aparecerão aqui para acompanhamento.
              </p>
              <Button variant="outline" onClick={() => setActiveTab("cursos")}>
                Explorar Cursos
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddCursoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAdd={handleAddCurso}
      />
    </MainLayout>
  );
};

export default Educacao;
