import { 
  Users, 
  Calendar,
  Mail,
  Phone,
  Building,
  Shield,
  FileText,
  Plus,
  UserPlus,
  CalendarPlus,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Member {
  id: string;
  name: string;
  role: string;
  municipality?: string;
  email: string;
  phone?: string;
  category: "obrigatorio" | "recomendado";
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

interface Document {
  id: string;
  name: string;
  date: string;
}

// Empty arrays - data will be populated from backend
const collegiateMembers: Member[] = [];
const upcomingMeetings: Meeting[] = [];
const documents: Document[] = [];

const Governanca = () => {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Governança</h1>
          <p className="text-muted-foreground">
            Estrutura do Colegiado Microrregional de Saúde Digital
          </p>
        </div>

        {/* Governance Overview */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Colegiado Microrregional de Saúde Digital
              </h2>
              <p className="text-muted-foreground">
                Instância máxima de decisão do núcleo, responsável pelo planejamento de formações, 
                identificação de demandas, acompanhamento de indicadores e resolução de problemas. 
                Reúne-se bimestralmente (preferencialmente presencial ou híbrida).
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Composição do Colegiado
              </h3>
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Adicionar Membro
              </Button>
            </div>
            
            {/* Mandatory Members */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                Representação Obrigatória
              </h4>
              {collegiateMembers.filter((m) => m.category === "obrigatorio").length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg bg-muted/20">
                  <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum membro cadastrado</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm text-center">
                    Adicione os membros obrigatórios: Coordenador, Pontos Focais, APS, Regulação, TI e SES-MG
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collegiateMembers
                    .filter((m) => m.category === "obrigatorio")
                    .map((member) => (
                      <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          {member.municipality && (
                            <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {member.municipality}
                            </p>
                          )}
                        </div>
                        <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Recommended Members */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                Representação Recomendada
              </h4>
              {collegiateMembers.filter((m) => m.category === "recomendado").length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 border border-dashed border-border rounded-lg bg-muted/20">
                  <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum membro recomendado</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Educação Permanente, Vigilância, etc.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collegiateMembers
                    .filter((m) => m.category === "recomendado")
                    .map((member) => (
                      <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-secondary/10 text-secondary">
                            {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Upcoming Meetings */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Próximas Reuniões
                </h3>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <CalendarPlus className="h-4 w-4" />
                </Button>
              </div>
              {upcomingMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 border border-dashed border-border rounded-lg bg-muted/20">
                  <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma reunião agendada</p>
                  <Button size="sm" variant="link" className="mt-2 h-auto p-0">
                    Agendar primeira reunião
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="p-3 rounded-lg border border-border">
                      <p className="font-medium text-foreground text-sm">{meeting.title}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {new Date(meeting.date).toLocaleDateString("pt-BR")} às {meeting.time}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {meeting.type}
                        </Badge>
                        <Badge 
                          className={meeting.status === "agendada" 
                            ? "bg-success/10 text-success border-success/20" 
                            : "bg-warning/10 text-warning border-warning/20"
                          }
                        >
                          {meeting.status === "agendada" ? "Confirmada" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full mt-4">
                Ver Calendário Completo
              </Button>
            </div>

            {/* Documents */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documentos Oficiais
                </h3>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 border border-dashed border-border rounded-lg bg-muted/20">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum documento</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 text-center">
                    Deliberações, atas, regimentos
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {doc.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Governanca;
