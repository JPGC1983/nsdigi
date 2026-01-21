import { 
  Users, 
  UserCircle, 
  Calendar,
  Mail,
  Phone,
  Building,
  Shield,
  Clock,
  FileText,
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

const collegiateMembers: Member[] = [
  {
    id: "1",
    name: "Dr. Carlos Eduardo Mendes",
    role: "Coordenador do Núcleo",
    email: "carlos.mendes@saude.mg.gov.br",
    phone: "(32) 99999-0001",
    category: "obrigatorio",
  },
  {
    id: "2",
    name: "Dra. Ana Paula Santos",
    role: "Ponto Focal - Barbacena",
    municipality: "Barbacena",
    email: "ana.santos@barbacena.mg.gov.br",
    category: "obrigatorio",
  },
  {
    id: "3",
    name: "Enf. Maria José Silva",
    role: "Representante APS/COSEMS",
    email: "maria.silva@cosems.org.br",
    category: "obrigatorio",
  },
  {
    id: "4",
    name: "Dr. Roberto Lima",
    role: "Gestor de Regulação",
    municipality: "São João del-Rei",
    email: "roberto.lima@sjdr.mg.gov.br",
    category: "obrigatorio",
  },
  {
    id: "5",
    name: "Tec. Fernando Costa",
    role: "Representante de TI",
    email: "fernando.costa@saude.mg.gov.br",
    category: "obrigatorio",
  },
  {
    id: "6",
    name: "Dra. Patrícia Oliveira",
    role: "Representante SES-MG/URS",
    email: "patricia.oliveira@saude.mg.gov.br",
    category: "obrigatorio",
  },
  {
    id: "7",
    name: "Enf. Lucas Andrade",
    role: "Educação Permanente",
    email: "lucas.andrade@saude.mg.gov.br",
    category: "recomendado",
  },
  {
    id: "8",
    name: "Dra. Camila Ferreira",
    role: "Vigilância em Saúde",
    municipality: "Congonhas",
    email: "camila.ferreira@congonhas.mg.gov.br",
    category: "recomendado",
  },
];

const upcomingMeetings = [
  {
    id: "1",
    title: "Reunião Ordinária do Colegiado",
    date: "2026-01-28",
    time: "14:00",
    type: "Híbrida",
    status: "agendada",
  },
  {
    id: "2",
    title: "Webencontro: Novidades e-SUS v5.3",
    date: "2026-02-05",
    time: "10:00",
    type: "Virtual",
    status: "agendada",
  },
  {
    id: "3",
    title: "Oficina de Maturidade Digital",
    date: "2026-02-15",
    time: "09:00",
    type: "Presencial",
    status: "confirmação",
  },
];

const documents = [
  { id: "1", name: "Deliberação CIR - Criação do Núcleo", date: "2025-06-15" },
  { id: "2", name: "Regimento Interno", date: "2025-07-20" },
  { id: "3", name: "Plano Anual de Ação 2026", date: "2025-12-10" },
  { id: "4", name: "Ata - Reunião Janeiro/2026", date: "2026-01-15" },
];

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
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Composição do Colegiado
            </h3>
            
            {/* Mandatory Members */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                Representação Obrigatória
              </h4>
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
            </div>

            {/* Recommended Members */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                Representação Recomendada
              </h4>
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Upcoming Meetings */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Próximas Reuniões
              </h3>
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-3 rounded-lg border border-border">
                    <p className="font-medium text-foreground text-sm">{meeting.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
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
              <Button variant="outline" className="w-full mt-4">
                Ver Calendário Completo
              </Button>
            </div>

            {/* Documents */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documentos Oficiais
              </h3>
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
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Governanca;
