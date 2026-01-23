import { useState, useEffect } from "react";
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
  Landmark,
  Save,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import AddMembroModal, { MembroData } from "@/components/modals/AddMembroModal";
import AddReuniaoModal, { ReuniaoData } from "@/components/modals/AddReuniaoModal";

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

const roleLabels: Record<string, string> = {
  coordenador: "Coordenador do Núcleo",
  ponto_focal: "Ponto Focal Municipal",
  aps: "Representante APS",
  regulacao: "Representante Regulação",
  ti: "Representante TI",
  ses: "Representante SES-MG",
  educacao: "Educação Permanente",
  vigilancia: "Vigilância em Saúde",
};

const Governanca = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [isMembroModalOpen, setIsMembroModalOpen] = useState(false);
  const [isReuniaoModalOpen, setIsReuniaoModalOpen] = useState(false);
  const [collegiateMembers, setCollegiateMembers] = useState<Member[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [documents] = useState<Document[]>([]);
  
  // CIB State
  const [cibDescription, setCibDescription] = useState("");
  const [cibDocId, setCibDocId] = useState<string | null>(null);
  const [isSavingCib, setIsSavingCib] = useState(false);
  const [isLoadingCib, setIsLoadingCib] = useState(true);
  const [canEditCib, setCanEditCib] = useState(false);

  // Check if user can edit CIB (admin or coordenador)
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setCanEditCib(false);
        return;
      }
      
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (roles) {
        const hasEditRole = roles.some(r => r.role === 'admin' || r.role === 'coordenador');
        setCanEditCib(hasEditRole);
      }
    };
    
    checkUserRole();
  }, [user]);

  // Fetch CIB documentation
  useEffect(() => {
    const fetchCibDoc = async () => {
      setIsLoadingCib(true);
      const { data, error } = await supabase
        .from('cib_documentation')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (!error && data) {
        setCibDescription(data.description);
        setCibDocId(data.id);
      }
      setIsLoadingCib(false);
    };
    
    fetchCibDoc();
  }, []);

  const handleSaveCib = async () => {
    if (!cibDescription.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha a descrição das reuniões da CIB.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingCib(true);
    try {
      if (cibDocId) {
        // Update existing
        const { error } = await supabase
          .from('cib_documentation')
          .update({ 
            description: cibDescription,
            updated_by: user?.id 
          })
          .eq('id', cibDocId);
        
        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('cib_documentation')
          .insert({ 
            description: cibDescription,
            updated_by: user?.id 
          })
          .select()
          .single();
        
        if (error) throw error;
        if (data) setCibDocId(data.id);
      }

      toast({
        title: "Salvo com sucesso",
        description: "As informações do Espaço CIB foram atualizadas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as informações.",
        variant: "destructive",
      });
    } finally {
      setIsSavingCib(false);
    }
  };

  const handleAddMembro = (data: MembroData) => {
    const newMember: Member = {
      id: crypto.randomUUID(),
      name: data.name,
      role: roleLabels[data.role] || data.role,
      municipality: data.municipality,
      email: data.email,
      phone: data.phone,
      category: data.category,
    };
    setCollegiateMembers([...collegiateMembers, newMember]);
  };

  const handleAddReuniao = (data: ReuniaoData) => {
    const newMeeting: Meeting = {
      id: crypto.randomUUID(),
      title: data.title,
      date: data.date,
      time: data.time,
      type: data.type === "presencial" ? "Presencial" : data.type === "virtual" ? "Virtual" : "Híbrida",
      status: "agendada",
    };
    setUpcomingMeetings([...upcomingMeetings, newMeeting]);
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Breadcrumbs */}
        <div className="space-y-4">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">Início</a>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground font-medium">Governança</span>
          </nav>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Governança</h1>
            <p className="text-muted-foreground">
              Estrutura do Colegiado Microrregional de Saúde Digital
            </p>
          </div>
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

        {/* Espaço CIB Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Landmark className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Espaço CIB
              </h2>
              <p className="text-muted-foreground text-sm">
                Documentação da participação nas reuniões da Comissão Intergestores Bipartite (CIB) 
                e seus impactos na gestão e organização da rede de saúde do território.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Descrição das reuniões da CIB <span className="text-destructive">*</span>
              </label>
              
              {isLoadingCib ? (
                <div className="flex items-center justify-center h-40 border border-border rounded-lg bg-muted/20">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Textarea
                  value={cibDescription}
                  onChange={(e) => setCibDescription(e.target.value)}
                  placeholder="Descreva de forma sintética o papel da CIB (Comissão Intergestores Bipartite) na governança do SUS no estado: espaço de negociação, pactuação e decisão entre Secretaria de Estado de Saúde e municípios sobre a operacionalização das políticas, organização da rede de serviços, financiamento e regionalização. Informe também como a equipe participa ou acompanha essas reuniões (por exemplo: frequência, temas principais discutidos, pactuações relevantes para o território e como as decisões são incorporadas ao planejamento local)."
                  className="min-h-[200px] resize-y"
                  disabled={!canEditCib}
                />
              )}
              
              <p className="text-xs text-muted-foreground">
                Registre aqui o resumo das reuniões da CIB e seus principais efeitos para o território. 
                Este campo pode ser atualizado sempre que necessário.
              </p>
            </div>

            {canEditCib && (
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSaveCib} 
                  disabled={isSavingCib || isLoadingCib}
                  className="gap-2"
                >
                  {isSavingCib ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            )}

            {!canEditCib && !isLoadingCib && (
              <p className="text-xs text-muted-foreground/60 italic">
                Apenas coordenadores e administradores podem editar este campo.
              </p>
            )}
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
              <Button size="sm" className="gap-2" onClick={() => setIsMembroModalOpen(true)}>
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
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsReuniaoModalOpen(true)}>
                  <CalendarPlus className="h-4 w-4" />
                </Button>
              </div>
              {upcomingMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 border border-dashed border-border rounded-lg bg-muted/20">
                  <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma reunião agendada</p>
                  <Button size="sm" variant="link" className="mt-2 h-auto p-0" onClick={() => setIsReuniaoModalOpen(true)}>
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

      <AddMembroModal
        open={isMembroModalOpen}
        onOpenChange={setIsMembroModalOpen}
        onAdd={handleAddMembro}
      />

      <AddReuniaoModal
        open={isReuniaoModalOpen}
        onOpenChange={setIsReuniaoModalOpen}
        onAdd={handleAddReuniao}
      />
    </MainLayout>
  );
};

export default Governanca;
