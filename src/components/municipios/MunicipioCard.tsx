import { useState } from "react";
import { MapPin, Users, TrendingUp, Phone, Mail, User, Edit2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Municipio, MunicipioPublic, MunicipioStatus, MunicipioUpdateData } from "@/hooks/useMunicipios";
import { cn } from "@/lib/utils";

interface MunicipioCardProps {
  municipio: Municipio | MunicipioPublic;
  onUpdate?: (id: string, data: MunicipioUpdateData) => void;
  canEdit?: boolean;
  showCoordinatorData?: boolean; // Nova prop para controlar exibição
}

const statusConfig: Record<MunicipioStatus, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-success/10 text-success border-success/20" },
  em_implantacao: { label: "Em Implantação", className: "bg-warning/10 text-warning border-warning/20" },
  pendente: { label: "Pendente", className: "bg-muted text-muted-foreground" },
  inativo: { label: "Inativo", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export const MunicipioCard = ({ municipio, onUpdate, canEdit = false, showCoordinatorData = false }: MunicipioCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Verificar se o município tem dados de coordenador (tipo completo)
  const hasCoordinatorData = 'coordenador_nome' in municipio;
  const coordenadorNome = hasCoordinatorData ? (municipio as Municipio).coordenador_nome : null;
  const coordenadorEmail = hasCoordinatorData ? (municipio as Municipio).coordenador_email : null;
  const coordenadorTelefone = hasCoordinatorData ? (municipio as Municipio).coordenador_telefone : null;
  
  const [editData, setEditData] = useState<MunicipioUpdateData>({
    status: municipio.status,
    coordenador_nome: coordenadorNome || "",
    coordenador_email: coordenadorEmail || "",
    coordenador_telefone: coordenadorTelefone || "",
  });

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(municipio.id, editData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      status: municipio.status,
      coordenador_nome: coordenadorNome || "",
      coordenador_email: coordenadorEmail || "",
      coordenador_telefone: coordenadorTelefone || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-md transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {municipio.municipio}
            </h3>
            <p className="text-sm text-muted-foreground">
              IBGE: {municipio.cod_ibge}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {isEditing ? (
            <Select
              value={editData.status}
              onValueChange={(value: MunicipioStatus) =>
                setEditData({ ...editData, status: value })
              }
            >
              <SelectTrigger className="w-36 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="em_implantacao">Em Implantação</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className={statusConfig[municipio.status].className}>
              {statusConfig[municipio.status].label}
            </Badge>
          )}
        </div>
      </div>

      {/* NMSD (Núcleo Microrregional) Info */}
      <div className="space-y-2 text-sm mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-2 text-primary font-medium">
          <span className="text-xs uppercase tracking-wide">Núcleo Microrregional de Saúde Digital</span>
        </div>
        <div className="font-semibold text-foreground">
          NMSD {municipio.microregiao}
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
          <span>Macrorregião: {municipio.macrorregiao}</span>
          <span>URS: {municipio.urs}</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Profissionais
          </span>
          <span className="font-medium text-foreground">{municipio.profissionais}</span>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Maturidade Digital
            </span>
            <span className="font-medium text-foreground">{municipio.maturidade_digital}%</span>
          </div>
          <Progress value={municipio.maturidade_digital} className="h-2" />
        </div>
      </div>

      {/* Coordinator Info (Editable) */}
      <div className="pt-3 border-t border-border space-y-2">
        {isEditing ? (
          <>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome do coordenador"
                value={editData.coordenador_nome}
                onChange={(e) => setEditData({ ...editData, coordenador_nome: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-mail"
                value={editData.coordenador_email}
                onChange={(e) => setEditData({ ...editData, coordenador_email: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Telefone"
                value={editData.coordenador_telefone}
                onChange={(e) => setEditData({ ...editData, coordenador_telefone: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </div>
          </>
        ) : (
          <>
            {showCoordinatorData && hasCoordinatorData ? (
              <>
                {coordenadorNome && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{coordenadorNome}</span>
                  </div>
                )}
                {coordenadorEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{coordenadorEmail}</span>
                  </div>
                )}
                {coordenadorTelefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{coordenadorTelefone}</span>
                  </div>
                )}
                {!coordenadorNome && !coordenadorEmail && (
                  <p className="text-sm text-muted-foreground italic">
                    Coordenador não informado
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Dados do coordenador restritos
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MunicipioCard;
