import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save,
  Phone,
  Mail,
  Briefcase,
  Camera,
  Loader2,
  Settings2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SeedRegionalizacaoButton from "@/components/admin/SeedRegionalizacaoButton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { useMunicipiosCadastro } from "@/components/shared/MunicipioCombobox";
import { ROLE_LABELS, STATUS_LABELS, RegistrationStatus } from "@/lib/permissions";

const NOTIF_KEY = "nmsd-preferencias-notificacao";
type NotifPrefs = { email: boolean; app: boolean; forum: boolean; course: boolean };
const loadNotifPrefs = (): NotifPrefs => {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) return { email: true, app: true, forum: true, course: true, ...JSON.parse(raw) };
  } catch {
    /* preferências inválidas: usa o padrão */
  }
  return { email: true, app: true, forum: true, course: true };
};

const Configuracoes = () => {
  const { user, profile, refreshProfile, isAdmin, roles } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: municipiosLista = [] } = useMunicipiosCadastro();
  const meuMunicipio = municipiosLista.find((m) => m.id === profile?.municipio_id);
  const [cbo, setCbo] = useState(profile?.cbo || "");
  const [cnes, setCnes] = useState(profile?.cnes || "");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [jobTitle, setJobTitle] = useState(profile?.job_title || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // O perfil chega depois do primeiro render; sincroniza os campos quando ele carregar.
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name || "");
    setPhone(profile.phone || "");
    setJobTitle(profile.job_title || "");
    setAvatarUrl(profile.avatar_url || null);
    setCbo(profile.cbo || "");
    setCnes(profile.cnes || "");
  }, [profile]);

  const metadataName = (user?.user_metadata?.full_name as string | undefined) || "";
  const displayName = fullName || profile?.full_name || metadataName || user?.email || "Usuário";

  // Preferências de notificação (guardadas neste navegador)
  const initialPrefs = loadNotifPrefs();
  const [emailNotifications, setEmailNotifications] = useState(initialPrefs.email);
  const [pushNotifications, setPushNotifications] = useState(initialPrefs.app);
  const [forumNotifications, setForumNotifications] = useState(initialPrefs.forum);
  const [courseNotifications, setCourseNotifications] = useState(initialPrefs.course);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add timestamp to bust cache
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: urlWithTimestamp,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(urlWithTimestamp);
      
      // Refresh profile to update context
      await refreshProfile();

      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar foto",
        description: error.message || "Não foi possível atualizar a foto.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone.replace(/\D/g, ""),
          job_title: jobTitle,
          cbo: cbo.trim() || null,
          cnes: cnes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({ title: "Senha muito curta", description: "Use pelo menos 8 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Senhas não conferem", description: "Digite a mesma senha nos dois campos.", variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsChangingPassword(false);
    if (error) {
      toast({
        title: "Não foi possível alterar a senha",
        description: error.message.includes("weak") || error.message.includes("pwned")
          ? "Essa senha é fraca ou já apareceu em vazamentos. Escolha outra."
          : error.message,
        variant: "destructive",
      });
      return;
    }
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordOpen(false);
    toast({ title: "Senha alterada", description: "Use a nova senha no próximo acesso." });
  };

  const handleSaveNotifications = () => {
    localStorage.setItem(
      NOTIF_KEY,
      JSON.stringify({ email: emailNotifications, app: pushNotifications, forum: forumNotifications, course: courseNotifications })
    );
    toast({
      title: "Preferências salvas",
      description: "Suas preferências de notificação foram atualizadas.",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Configurações"
          description="Gerencie suas preferências e informações pessoais"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Configurações" },
          ]}
        />

        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="aparencia" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize suas informações de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                      <AvatarImage src={avatarUrl || profile?.avatar_url || ""} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {getInitials(fullName || profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={handleAvatarClick}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{displayName}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {roles.map((r) => (
                        <Badge key={r} variant="secondary">{ROLE_LABELS[r] ?? r}</Badge>
                      ))}
                      {profile?.status && (
                        <Badge variant="outline">{STATUS_LABELS[profile.status as RegistrationStatus] ?? profile.status}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Clique na foto para alterar
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome Completo
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Cargo
                    </Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Seu cargo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cbo">CBO</Label>
                    <Input id="cbo" value={cbo} onChange={(e) => setCbo(e.target.value)} placeholder="Código da ocupação" maxLength={10} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnes">CNES (opcional)</Label>
                    <Input id="cnes" value={cnes} onChange={(e) => setCnes(e.target.value)} placeholder="Estabelecimento onde atua" maxLength={10} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="municipio-atual">Município</Label>
                    <Input
                      id="municipio-atual"
                      value={meuMunicipio ? `${meuMunicipio.municipio} – NMSD ${meuMunicipio.microregiao}` : "Não informado"}
                      disabled
                      className="bg-muted"
                      aria-describedby="municipio-ajuda"
                    />
                    <p id="municipio-ajuda" className="text-xs text-muted-foreground">
                      Para mudar de município, procure a coordenação do seu NMSD.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Configure como você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações por E-mail</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber atualizações por e-mail
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Avisos no aplicativo</Label>
                      <p className="text-sm text-muted-foreground">
                        Mostrar avisos no sino da plataforma
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Atualizações de Fóruns</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar sobre novos posts e respostas
                      </p>
                    </div>
                    <Switch
                      checked={forumNotifications}
                      onCheckedChange={setForumNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Atualizações de Cursos</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar sobre novos cursos e materiais
                      </p>
                    </div>
                    <Switch
                      checked={courseNotifications}
                      onCheckedChange={setCourseNotifications}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Segurança da Conta
                </CardTitle>
                <CardDescription>
                  Gerencie a segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <p className="text-base font-medium">Alterar senha</p>
                      <p className="text-sm text-muted-foreground">
                        Defina uma nova senha de acesso. Use pelo menos 8 caracteres.
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setPasswordOpen(true)}>Alterar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="aparencia" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="tema-escuro" className="text-base">Tema escuro</Label>
                      <p className="text-sm text-muted-foreground">
                        Alterna entre o tema claro e o escuro
                      </p>
                    </div>
                    <Switch
                      id="tema-escuro"
                      checked={theme === "dark"}
                      onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab - Only visible for admins */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Administração
                  </CardTitle>
                  <CardDescription>
                    Configurações avançadas para administradores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SeedRegionalizacaoButton />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>Digite a nova senha duas vezes para confirmar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nova-senha">Nova senha</Label>
              <Input id="nova-senha" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
              <Input id="confirmar-senha" type="password" autoComplete="new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Salvar nova senha
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Configuracoes;
