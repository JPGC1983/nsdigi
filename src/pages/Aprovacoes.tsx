import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UserCheck, UserX, Users, Loader2, AlertTriangle, RefreshCw, Pencil, Info } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import NoPermission from "@/components/shared/NoPermission";
import MunicipioCombobox from "@/components/shared/MunicipioCombobox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNucleosMicrorregionais } from "@/hooks/useNucleosMicrorregionais";
import {
  AppRole,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  canReviewRegistrations,
  grantableRoles,
  primaryRole,
} from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Registration {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  cbo: string | null;
  cnes: string | null;
  municipio_id: string | null;
  municipio: string | null;
  microregiao: string | null;
  nucleo_id: string | null;
  urs: string | null;
  status: string;
  aceite_termos_em: string | null;
  created_at: string;
  motivo_recusa: string | null;
  roles: string[];
}

type StatusTab = "pendente" | "ativo" | "inativo";

const formatPhone = (p: string | null) => {
  if (!p) return "—";
  const n = p.replace(/\D/g, "");
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return p;
};

const useRegistrations = (status: StatusTab, enabled: boolean) =>
  useQuery({
    queryKey: ["registrations", status],
    enabled,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_registrations", { _status: status });
      if (error) throw error;
      return (data || []) as Registration[];
    },
  });

const Aprovacoes = () => {
  const { roles, profileLoaded, isAdmin, isCoordinator, coordinatorNmsdIds } = useAuth();
  const allowed = canReviewRegistrations(roles);
  const [tab, setTab] = useState<StatusTab>("pendente");
  const [approving, setApproving] = useState<Registration | null>(null);
  const [rejecting, setRejecting] = useState<Registration | null>(null);

  const pending = useRegistrations("pendente", allowed);
  const active = useRegistrations("ativo", allowed && tab === "ativo");
  const inactive = useRegistrations("inativo", allowed && tab === "inativo");

  if (!profileLoaded) {
    return (
      <MainLayout>
        <Skeleton className="h-40 w-full rounded-xl" />
      </MainLayout>
    );
  }

  if (!allowed) {
    return (
      <MainLayout>
        <NoPermission message="A aprovação de cadastros é feita pela coordenação do NMSD e pelo Admin URS/SES." />
      </MainLayout>
    );
  }

  const queries = { pendente: pending, ativo: active, inativo: inactive };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Aprovação de cadastros"
          description={
            isAdmin
              ? "Confira os cadastros de todos os NMSDs, defina perfis e aprove coordenadores."
              : "Confira os cadastros dos profissionais do seu NMSD e defina o perfil de cada um."
          }
          breadcrumbs={[{ label: "Aprovação de cadastros" }]}
        />

        {isCoordinator && !isAdmin && coordinatorNmsdIds.length === 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm" role="status">
            <Info className="h-5 w-5 text-warning shrink-0" aria-hidden="true" />
            <p className="text-foreground">
              Seu perfil de coordenador ainda não está vinculado a um NMSD. Peça ao Admin URS/SES para vincular seu núcleo;
              até lá, nenhum cadastro aparecerá aqui.
            </p>
          </div>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as StatusTab)}>
          <TabsList>
            <TabsTrigger value="pendente" className="gap-2">
              Pendentes
              {(pending.data?.length ?? 0) > 0 && (
                <Badge className="h-5 min-w-5 px-1.5 text-xs">{pending.data?.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ativo">Ativos</TabsTrigger>
            <TabsTrigger value="inativo">Recusados e inativos</TabsTrigger>
          </TabsList>

          {(["pendente", "ativo", "inativo"] as StatusTab[]).map((status) => {
            const q = queries[status];
            return (
              <TabsContent key={status} value={status} className="mt-4">
                {q.isLoading ? (
                  <div className="space-y-3" aria-busy="true">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-28 w-full rounded-xl" />
                    ))}
                  </div>
                ) : q.isError ? (
                  <div role="alert" className="rounded-xl border border-border bg-card p-8 text-center">
                    <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" aria-hidden="true" />
                    <p className="font-medium text-foreground mb-1">Não foi possível carregar os cadastros</p>
                    <p className="text-sm text-muted-foreground mb-4">Verifique sua conexão e tente novamente.</p>
                    <Button variant="outline" onClick={() => q.refetch()} className="gap-2">
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                      Tentar novamente
                    </Button>
                  </div>
                ) : (q.data?.length ?? 0) === 0 ? (
                  <EmptyState
                    icon={Users}
                    title={
                      status === "pendente"
                        ? "Nenhum cadastro aguardando aprovação"
                        : status === "ativo"
                        ? "Nenhum profissional ativo"
                        : "Nenhum cadastro recusado ou inativo"
                    }
                    description={
                      status === "pendente"
                        ? "Quando um profissional se cadastrar na plataforma, o pedido aparecerá aqui para você conferir."
                        : "Os cadastros aparecerão aqui conforme forem revisados."
                    }
                  />
                ) : (
                  <ul className="space-y-3">
                    {q.data!.map((r) => (
                      <RegistrationCard
                        key={r.id}
                        registration={r}
                        onApprove={() => setApproving(r)}
                        onReject={status !== "inativo" ? () => setRejecting(r) : undefined}
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {approving && (
        <ApproveDialog registration={approving} callerRoles={roles} onClose={() => setApproving(null)} />
      )}
      {rejecting && <RejectDialog registration={rejecting} onClose={() => setRejecting(null)} />}
    </MainLayout>
  );
};

const RegistrationCard = ({
  registration: r,
  onApprove,
  onReject,
}: {
  registration: Registration;
  onApprove: () => void;
  onReject?: () => void;
}) => {
  const role = primaryRole(r.roles as AppRole[]);
  return (
    <li className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{r.full_name || "Nome não informado"}</h3>
            {role && r.status === "ativo" && <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>}
            {!r.aceite_termos_em && (
              <Badge variant="outline" className="border-warning/40 text-warning">Sem aceite dos termos</Badge>
            )}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-1 text-sm">
            <div className="flex gap-1"><dt className="text-muted-foreground">E-mail:</dt><dd className="truncate">{r.email || "—"}</dd></div>
            <div className="flex gap-1"><dt className="text-muted-foreground">Telefone:</dt><dd>{formatPhone(r.phone)}</dd></div>
            <div className="flex gap-1"><dt className="text-muted-foreground">Cargo:</dt><dd>{r.job_title || "—"}</dd></div>
            <div className="flex gap-1"><dt className="text-muted-foreground">CBO:</dt><dd>{r.cbo || "—"}</dd></div>
            <div className="flex gap-1"><dt className="text-muted-foreground">CNES:</dt><dd>{r.cnes || "—"}</dd></div>
            <div className="flex gap-1">
              <dt className="text-muted-foreground">Município:</dt>
              <dd>{r.municipio ? `${r.municipio} (NMSD ${r.microregiao})` : "Não informado"}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            Cadastrado em {format(new Date(r.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
          {r.motivo_recusa && (
            <p className="text-xs text-muted-foreground"><span className="font-medium">Motivo da recusa:</span> {r.motivo_recusa}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button size="sm" onClick={onApprove} className="gap-2">
            {r.status === "ativo" ? <Pencil className="h-4 w-4" aria-hidden="true" /> : <UserCheck className="h-4 w-4" aria-hidden="true" />}
            {r.status === "pendente" ? "Aprovar" : r.status === "ativo" ? "Ajustar perfil" : "Reativar"}
          </Button>
          {onReject && (
            <Button size="sm" variant="outline" onClick={onReject} className="gap-2 text-destructive hover:text-destructive">
              <UserX className="h-4 w-4" aria-hidden="true" />
              {r.status === "pendente" ? "Recusar" : "Inativar"}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
};

const ApproveDialog = ({
  registration: r,
  callerRoles,
  onClose,
}: {
  registration: Registration;
  callerRoles: AppRole[];
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const options = grantableRoles(callerRoles);
  const current = primaryRole(r.roles as AppRole[]);
  const [role, setRole] = useState<AppRole>(current && options.includes(current) ? current : "membro");
  const [municipioId, setMunicipioId] = useState<string | null>(r.municipio_id);
  const [nmsdId, setNmsdId] = useState<string>(r.nucleo_id ?? "");
  const [jobTitle, setJobTitle] = useState(r.job_title ?? "");
  const [cbo, setCbo] = useState(r.cbo ?? "");
  const [cnes, setCnes] = useState(r.cnes ?? "");
  const [saving, setSaving] = useState(false);
  const { nucleos } = useNucleosMicrorregionais();
  const sortedNucleos = useMemo(() => [...nucleos].sort((a, b) => a.microregiao.localeCompare(b.microregiao)), [nucleos]);

  const needsMunicipio = role !== "admin" && role !== "coordenador";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsMunicipio && !municipioId) {
      toast.error("Informe o município do profissional.");
      return;
    }
    if (role === "coordenador" && !nmsdId) {
      toast.error("Informe o NMSD do coordenador.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc("review_registration", {
      _user_id: r.id,
      _decision: "aprovar",
      _role: role,
      _municipio_id: municipioId ?? undefined,
      _nmsd_id: role === "coordenador" ? nmsdId : undefined,
      _job_title: jobTitle || undefined,
      _cbo: cbo || undefined,
      _cnes: cnes || undefined,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message || "Não foi possível aprovar o cadastro.");
      return;
    }
    toast.success(`${r.full_name || "Cadastro"} aprovado como ${ROLE_LABELS[role]}.`);
    queryClient.invalidateQueries({ queryKey: ["registrations"] });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{r.status === "ativo" ? "Ajustar perfil" : "Aprovar cadastro"}</DialogTitle>
          <DialogDescription>
            Confira os dados de {r.full_name || "profissional"} e defina o perfil de acesso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aprovar-perfil">Perfil de acesso</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger id="aprovar-perfil">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o} value={o}>{ROLE_LABELS[o]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
          </div>

          {role === "coordenador" && (
            <div className="space-y-2">
              <Label htmlFor="aprovar-nmsd">NMSD que irá coordenar</Label>
              <Select value={nmsdId} onValueChange={setNmsdId}>
                <SelectTrigger id="aprovar-nmsd">
                  <SelectValue placeholder="Selecione o núcleo" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {sortedNucleos.map((n) => (
                    <SelectItem key={n.id} value={n.id}>NMSD {n.microregiao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="aprovar-municipio">Município{needsMunicipio ? "" : " (opcional)"}</Label>
            <MunicipioCombobox id="aprovar-municipio" value={municipioId} onChange={setMunicipioId} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2 sm:col-span-3">
              <Label htmlFor="aprovar-cargo">Cargo</Label>
              <Input id="aprovar-cargo" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aprovar-cbo">CBO</Label>
              <Input id="aprovar-cbo" value={cbo} onChange={(e) => setCbo(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="aprovar-cnes">CNES</Label>
              <Input id="aprovar-cnes" value={cnes} onChange={(e) => setCnes(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {r.status === "ativo" ? "Salvar perfil" : "Aprovar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const RejectDialog = ({ registration: r, onClose }: { registration: Registration; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.rpc("review_registration", {
      _user_id: r.id,
      _decision: "recusar",
      _motivo: motivo || undefined,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message || "Não foi possível recusar o cadastro.");
      return;
    }
    toast.success(r.status === "pendente" ? "Cadastro recusado." : "Acesso inativado.");
    queryClient.invalidateQueries({ queryKey: ["registrations"] });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{r.status === "pendente" ? "Recusar cadastro" : "Inativar acesso"}</DialogTitle>
          <DialogDescription>
            {r.full_name || "O profissional"} perderá o acesso à plataforma. O motivo será mostrado a ele.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recusar-motivo">Motivo (opcional)</Label>
            <Textarea
              id="recusar-motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: município informado não pertence a este NMSD"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="destructive" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {r.status === "pendente" ? "Recusar" : "Inativar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Aprovacoes;
