import { useState } from "react";
import { 
  FileText, 
  Video, 
  HelpCircle, 
  FileCheck, 
  BookOpen,
  Search,
  Download,
  Eye,
  Filter,
  FolderOpen,
  Clock,
  User,
  Plus,
  ExternalLink,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddMaterialModal, { MATERIAL_CATEGORIES } from "@/components/modals/AddMaterialModal";
import { useAuth } from "@/hooks/useAuth";
import { canPublishMaterials } from "@/lib/permissions";
import { useMaterials } from "@/hooks/useMaterials";

const typeConfig = {
  video: { icon: Video, label: "Vídeo", plural: "Vídeos", className: "bg-destructive/10 text-destructive" },
  manual: { icon: FileText, label: "Manual", plural: "Manuais", className: "bg-primary/10 text-primary" },
  faq: { icon: HelpCircle, label: "FAQ", plural: "FAQs", className: "bg-warning/10 text-warning" },
  template: { icon: FileCheck, label: "Template", plural: "Templates", className: "bg-success/10 text-success" },
  legislacao: { icon: BookOpen, label: "Legislação", plural: "Legislação", className: "bg-info/10 text-info" },
};

const categories = ["Todos", ...MATERIAL_CATEGORIES];

const Repositorio = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, roles } = useAuth();
  const { materials, isLoading, addMaterial, openMaterial } = useMaterials();
  const canPublish = !!user && canPublishMaterials(roles);

  const term = searchTerm.trim().toLowerCase();
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      !term || m.title.toLowerCase().includes(term) || (m.description ?? "").toLowerCase().includes(term);
    const matchesCategory = categoryFilter === "Todos" || m.category === categoryFilter;
    const matchesType = typeFilter === "all" || m.material_type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Repositório de Materiais"
          description="Tutoriais, manuais, FAQs e documentos de referência"
          breadcrumbs={[{ label: "Repositório" }]}
          action={canPublish ? {
            label: "Enviar Material",
            icon: Plus,
            onClick: () => setIsModalOpen(true),
          } : undefined}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(typeConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = materials.filter((m) => m.material_type === key).length;
            return (
              <div key={key} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-lg ${config.className} flex items-center justify-center`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-sm text-muted-foreground">{count === 1 ? config.label : config.plural}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar materiais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="video">Vídeos</SelectItem>
              <SelectItem value="manual">Manuais</SelectItem>
              <SelectItem value="faq">FAQs</SelectItem>
              <SelectItem value="template">Templates</SelectItem>
              <SelectItem value="legislacao">Legislação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Tabs */}
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
          <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={categoryFilter} className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : filteredMaterials.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title={materials.length === 0 ? "Biblioteca de materiais vazia" : "Nenhum material encontrado"}
                description={
                  materials.length === 0
                    ? "Envie tutoriais, manuais, FAQs e templates para apoiar os profissionais no uso dos sistemas de saúde digital."
                    : "Nenhum material corresponde à busca ou aos filtros. Ajuste os critérios ou envie um novo material."
                }
                actionLabel={canPublish ? (materials.length === 0 ? "Enviar primeiro material" : "Enviar material") : undefined}
                onAction={canPublish ? () => setIsModalOpen(true) : undefined}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredMaterials.map((material) => {
                  const cfg = typeConfig[material.material_type] ?? typeConfig.manual;
                  const TypeIcon = cfg.icon;
                  const isLink = !material.file_path;
                  return (
                    <div
                      key={material.id}
                      className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-lg ${cfg.className} flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {material.title}
                            </h3>
                            {material.category && (
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {material.category}
                              </Badge>
                            )}
                          </div>
                          {material.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{material.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {material.author || "Autor não informado"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(material.updated_at).toLocaleDateString("pt-BR")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {material.downloads} {material.downloads === 1 ? "acesso" : "acessos"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {isLink ? (
                              <Button size="sm" className="gap-1" onClick={() => openMaterial(material, true)}>
                                <ExternalLink className="h-4 w-4" />
                                Abrir link
                              </Button>
                            ) : (
                              <>
                                <Button variant="outline" size="sm" className="gap-1" onClick={() => openMaterial(material, false)}>
                                  <Eye className="h-4 w-4" />
                                  Visualizar
                                </Button>
                                <Button size="sm" className="gap-1" onClick={() => openMaterial(material, true)}>
                                  <Download className="h-4 w-4" />
                                  Baixar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddMaterialModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAdd={addMaterial}
      />
    </MainLayout>
  );
};

export default Repositorio;
