import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, XCircle, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MunicipioCombobox from "@/components/shared/MunicipioCombobox";
import AppFooter from "@/components/layout/AppFooter";
import { toast } from "sonner";

/** Tela exibida a quem ainda não foi aprovado (ou teve o cadastro recusado/inativado). */
const RegistrationStatusScreen = () => {
  const { user, profile, isInactive, signOut, refreshProfile } = useAuth();
  const [municipioId, setMunicipioId] = useState<string | null>(profile?.municipio_id ?? null);
  const [aceite, setAceite] = useState(false);
  const [saving, setSaving] = useState(false);

  const missingMunicipio = !profile?.municipio_id;
  const missingAceite = !profile?.aceite_termos_em;

  const handleComplete = async () => {
    if (!user) return;
    if (missingMunicipio && !municipioId) {
      toast.error("Selecione seu município.");
      return;
    }
    if (missingAceite && !aceite) {
      toast.error("É preciso aceitar o Termo de Uso e a Política de Privacidade.");
      return;
    }
    setSaving(true);
    const update: { municipio_id?: string; aceite_termos_em?: string } = {};
    if (missingMunicipio && municipioId) update.municipio_id = municipioId;
    if (missingAceite) update.aceite_termos_em = new Date().toISOString();
    const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar. Tente novamente.");
      return;
    }
    toast.success("Dados enviados para a coordenação.");
    refreshProfile();
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8 shadow-card">
          {isInactive ? (
            <>
              <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <XCircle className="h-7 w-7 text-destructive" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-semibold text-foreground text-center mb-2">Cadastro não aprovado ou inativo</h1>
              <p className="text-sm text-muted-foreground text-center mb-2">
                Seu acesso à plataforma não está ativo. Em caso de dúvida, procure a coordenação do NMSD da sua microrregião.
              </p>
              {profile?.motivo_recusa && (
                <p className="text-sm text-foreground bg-muted rounded-lg p-3 mb-4">
                  <span className="font-medium">Motivo informado: </span>
                  {profile.motivo_recusa}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-semibold text-foreground text-center mb-2">Cadastro aguardando aprovação</h1>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Recebemos seu cadastro. A coordenação do NMSD da sua microrregião vai conferir seus dados e liberar o acesso.
                Você poderá entrar normalmente assim que for aprovado.
              </p>

              {(missingMunicipio || missingAceite) && (
                <div className="space-y-4 border-t border-border pt-6 mb-2">
                  <p className="text-sm font-medium text-foreground">Para enviar seu cadastro, complete:</p>
                  {missingMunicipio && (
                    <div className="space-y-2">
                      <Label htmlFor="completar-municipio">Município</Label>
                      <MunicipioCombobox id="completar-municipio" value={municipioId} onChange={setMunicipioId} />
                    </div>
                  )}
                  {missingAceite && (
                    <div className="flex items-start gap-2">
                      <Checkbox id="completar-aceite" checked={aceite} onCheckedChange={(v) => setAceite(v === true)} />
                      <Label htmlFor="completar-aceite" className="text-sm font-normal leading-snug">
                        Li e aceito o{" "}
                        <Link to="/termo-de-uso" target="_blank" className="text-primary underline">Termo de Uso</Link> e a{" "}
                        <Link to="/politica-de-privacidade" target="_blank" className="text-primary underline">Política de Privacidade</Link>.
                      </Label>
                    </div>
                  )}
                  <Button onClick={handleComplete} disabled={saving} className="w-full">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                    Enviar para aprovação
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="flex justify-center mt-6">
            <Button variant="ghost" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sair
            </Button>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default RegistrationStatusScreen;
