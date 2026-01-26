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
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageSquare,
  Target,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import AddMembroModal, { MembroData } from "@/components/modals/AddMembroModal";
import AddReuniaoModal, { ReuniaoData } from "@/components/modals/AddReuniaoModal";
import AddCibMeetingModal, { CibMeetingData } from "@/components/modals/AddCibMeetingModal";
import AddDocumentoModal, { DocumentData } from "@/components/modals/AddDocumentoModal";

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
  description: string | null;
  file_path: string;
  file_type: string;
  file_size: number | null;
  category: string;
  created_at: string;
}

interface CibMeeting {
  id: string;
  meeting_date: string;
  themes: string;
  deliberations: string | null;
  territory_impacts: string | null;
  participation_type: string;
  participants: string | null;
  notes: string | null;
  created_at: string;
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
  const [isDocumentoModalOpen, setIsDocumentoModalOpen] = useState(false);
  const [collegiateMembers, setCollegiateMembers] = useState<Member[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [canEditDocuments, setCanEditDocuments] = useState(false);
  
  // CIB State
  const [cibMeetings, setCibMeetings] = useState<CibMeeting[]>([]);
  const [isLoadingCib, setIsLoadingCib] = useState(true);
  const [canEditCib, setCanEditCib] = useState(false);
  const [isCibMeetingModalOpen, setIsCibMeetingModalOpen] = useState(false);
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set());

  // Check if user can edit CIB and documents (admin or coordenador)
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        console.log('No user found, disabling edit permissions');
        setCanEditCib(false);
        setCanEditDocuments(false);
        return;
      }
      
      console.log('Checking roles for user:', user.id);
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      console.log('User roles response:', { roles, error });
      
      if (roles && roles.length > 0) {
        const hasEditRole = roles.some(r => r.role === 'admin' || r.role === 'coordenador');
        console.log('Has edit role:', hasEditRole);
        setCanEditCib(hasEditRole);
        setCanEditDocuments(hasEditRole);
      } else {
        console.log('No roles found for user');
        setCanEditCib(false);
        setCanEditDocuments(false);
      }
    };
    
    checkUserRole();
  }, [user]);

  // Fetch governance documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoadingDocuments(true);
      const { data, error } = await supabase
        .from('governance_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setDocuments(data as Document[]);
      }
      setIsLoadingDocuments(false);
    };
    
    fetchDocuments();
  }, []);

  // Fetch CIB meetings
  useEffect(() => {
    const fetchCibMeetings = async () => {
      setIsLoadingCib(true);
      const { data, error } = await supabase
        .from('cib_meetings')
        .select('*')
        .order('meeting_date', { ascending: false });
      
      if (!error && data) {
        setCibMeetings(data as CibMeeting[]);
      }
      setIsLoadingCib(false);
    };
    
    fetchCibMeetings();
  }, []);

  const handleAddCibMeeting = async (data: CibMeetingData) => {
    const { data: newMeeting, error } = await supabase
      .from('cib_meetings')
      .insert({
        meeting_date: data.meeting_date,
        themes: data.themes,
        deliberations: data.deliberations || null,
        territory_impacts: data.territory_impacts || null,
        participation_type: data.participation_type,
        participants: data.participants || null,
        notes: data.notes || null,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao registrar",
        description: error.message || "Não foi possível registrar a reunião.",
        variant: "destructive",
      });
      throw error;
    }

    if (newMeeting) {
      setCibMeetings([newMeeting as CibMeeting, ...cibMeetings]);
      toast({
        title: "Reunião registrada",
        description: "A reunião da CIB foi registrada com sucesso.",
      });
    }
  };

  const toggleMeetingExpand = (meetingId: string) => {
    const newExpanded = new Set(expandedMeetings);
    if (newExpanded.has(meetingId)) {
      newExpanded.delete(meetingId);
    } else {
      newExpanded.add(meetingId);
    }
    setExpandedMeetings(newExpanded);
  };

  const getParticipationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      presencial: "Presencial",
      virtual: "Virtual",
      hibrida: "Híbrida",
      acompanhamento: "Acompanhamento",
    };
    return labels[type] || type;
  };

  const getParticipationTypeBadgeClass = (type: string) => {
    const classes: Record<string, string> = {
      presencial: "bg-success/10 text-success border-success/20",
      virtual: "bg-info/10 text-info border-info/20",
      hibrida: "bg-warning/10 text-warning border-warning/20",
      acompanhamento: "bg-muted text-muted-foreground border-border",
    };
    return classes[type] || "bg-muted text-muted-foreground border-border";
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

  const handleAddDocumento = async (data: DocumentData) => {
    const fileExt = data.file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('governance-documents')
      .upload(filePath, data.file);

    if (uploadError) {
      toast({
        title: "Erro no upload",
        description: uploadError.message || "Não foi possível enviar o arquivo.",
        variant: "destructive",
      });
      throw uploadError;
    }

    // Insert document record
    const { data: newDoc, error: insertError } = await supabase
      .from('governance_documents')
      .insert({
        name: data.name,
        description: data.description || null,
        file_path: filePath,
        file_type: data.file.type || fileExt || 'unknown',
        file_size: data.file.size,
        category: data.category,
        uploaded_by: user?.id,
      })
      .select()
      .single();

    if (insertError) {
      toast({
        title: "Erro ao salvar",
        description: insertError.message || "Não foi possível salvar o documento.",
        variant: "destructive",
      });
      throw insertError;
    }

    if (newDoc) {
      setDocuments([newDoc as Document, ...documents]);
      toast({
        title: "Documento adicionado",
        description: "O documento foi enviado com sucesso.",
      });
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      atas: "Atas de Reunião",
      deliberacoes: "Deliberações",
      regimentos: "Regimentos",
      portarias: "Portarias",
      resolucoes: "Resoluções",
      outros: "Outros",
    };
    return labels[category] || category;
  };

  const handleDownloadDocument = async (doc: Document) => {
    const { data } = supabase.storage
      .from('governance-documents')
      .getPublicUrl(doc.file_path);
    
    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
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
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Landmark className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Espaço CIB
                </h2>
                <p className="text-muted-foreground text-sm">
                  Registro da participação nas reuniões da Comissão Intergestores Bipartite (CIB) 
                  e seus impactos na gestão e organização da rede de saúde do território.
                </p>
              </div>
            </div>
            {canEditCib && (
              <Button 
                onClick={() => setIsCibMeetingModalOpen(true)}
                className="gap-2 shrink-0"
              >
                <Plus className="h-4 w-4" />
                Registrar Reunião
              </Button>
            )}
          </div>

          {isLoadingCib ? (
            <div className="flex items-center justify-center h-32 border border-border rounded-lg bg-muted/20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : cibMeetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-lg bg-muted/20">
              <Landmark className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-medium mb-1">
                Nenhuma reunião registrada
              </p>
              <p className="text-sm text-muted-foreground/60 text-center max-w-md mb-4">
                Registre as reuniões da CIB para documentar as deliberações, pactuações e seus impactos no território.
              </p>
              {canEditCib && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsCibMeetingModalOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Registrar primeira reunião
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {cibMeetings.map((meeting) => {
                const isExpanded = expandedMeetings.has(meeting.id);
                return (
                  <Collapsible
                    key={meeting.id}
                    open={isExpanded}
                    onOpenChange={() => toggleMeetingExpand(meeting.id)}
                  >
                    <div className="border border-border rounded-lg overflow-hidden">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-foreground">
                                Reunião CIB - {new Date(meeting.meeting_date + 'T12:00:00').toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {meeting.themes}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getParticipationTypeBadgeClass(meeting.participation_type)}>
                              {getParticipationTypeLabel(meeting.participation_type)}
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/20">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                                  <MessageSquare className="h-4 w-4 text-primary" />
                                  Temas Discutidos
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {meeting.themes}
                                </p>
                              </div>
                              
                              {meeting.deliberations && (
                                <div>
                                  <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Deliberações e Pactuações
                                  </div>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {meeting.deliberations}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              {meeting.territory_impacts && (
                                <div>
                                  <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                                    <Target className="h-4 w-4 text-primary" />
                                    Impactos para o Território
                                  </div>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {meeting.territory_impacts}
                                  </p>
                                </div>
                              )}
                              
                              {meeting.participants && (
                                <div>
                                  <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                                    <Users className="h-4 w-4 text-primary" />
                                    Participantes
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {meeting.participants}
                                  </p>
                                </div>
                              )}
                              
                              {meeting.notes && (
                                <div>
                                  <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                                    <Clock className="h-4 w-4 text-primary" />
                                    Observações
                                  </div>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {meeting.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}

          {!canEditCib && !isLoadingCib && cibMeetings.length === 0 && (
            <p className="text-xs text-muted-foreground/60 italic mt-2">
              Apenas coordenadores e administradores podem registrar reuniões.
            </p>
          )}
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
                {canEditDocuments && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={() => setIsDocumentoModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isLoadingDocuments ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 border border-dashed border-border rounded-lg bg-muted/20">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum documento</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 text-center">
                    Deliberações, atas, regimentos
                  </p>
                  {canEditDocuments && (
                    <Button 
                      size="sm" 
                      variant="link" 
                      className="mt-2 h-auto p-0"
                      onClick={() => setIsDocumentoModalOpen(true)}
                    >
                      Adicionar documento
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(doc.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
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

      <AddCibMeetingModal
        open={isCibMeetingModalOpen}
        onOpenChange={setIsCibMeetingModalOpen}
        onAdd={handleAddCibMeeting}
      />

      <AddDocumentoModal
        open={isDocumentoModalOpen}
        onOpenChange={setIsDocumentoModalOpen}
        onAdd={handleAddDocumento}
      />
    </MainLayout>
  );
};

export default Governanca;
