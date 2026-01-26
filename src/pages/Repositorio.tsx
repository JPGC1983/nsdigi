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
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddMaterialModal, { MaterialData } from "@/components/modals/AddMaterialModal";

interface Material {
  id: string;
  title: string;
  description: string;
  type: "video" | "manual" | "faq" | "template" | "legislacao";
  category: string;
  downloads: number;
  updatedAt: string;
  author: string;
}

const typeConfig = {
  video: { icon: Video, label: "Vídeo", className: "bg-destructive/10 text-destructive" },
  manual: { icon: FileText, label: "Manual", className: "bg-primary/10 text-primary" },
  faq: { icon: HelpCircle, label: "FAQ", className: "bg-warning/10 text-warning" },
  template: { icon: FileCheck, label: "Template", className: "bg-success/10 text-success" },
  legislacao: { icon: BookOpen, label: "Legislação", className: "bg-info/10 text-info" },
};

const categories = ["Todos", "e-SUS", "RNDS", "Telessaúde", "Gestão", "Legislação"];

const Repositorio = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);

  const handleAddMaterial = (data: MaterialData) => {
    const newMaterial: Material = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      downloads: 0,
      updatedAt: new Date().toISOString(),
      author: data.author,
    };
    setMaterials([...materials, newMaterial]);
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Todos" || m.category === categoryFilter;
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Repositório de Materiais"
          description="Tutoriais, manuais, FAQs e documentos de referência"
          breadcrumbs={[{ label: "Repositório" }]}
          action={{
            label: "Enviar Material",
            icon: Plus,
            onClick: () => setIsModalOpen(true),
          }}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(typeConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = materials.filter((m) => m.type === key).length;
            return (
              <div key={key} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-lg ${config.className} flex items-center justify-center`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-sm text-muted-foreground">{config.label}s</p>
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
            {filteredMaterials.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="Biblioteca de materiais vazia"
                description="Adicione tutoriais, manuais, FAQs e templates para apoiar os profissionais na utilização dos sistemas de saúde digital."
                actionLabel="Adicionar Primeiro Material"
                onAction={() => setIsModalOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredMaterials.map((material) => {
                  const TypeIcon = typeConfig[material.type].icon;
                  return (
                    <div
                      key={material.id}
                      className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-lg ${typeConfig[material.type].className} flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {material.title}
                            </h3>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {material.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{material.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {material.author || "Autor não informado"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(material.updatedAt).toLocaleDateString("pt-BR")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {material.downloads} downloads
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Eye className="h-4 w-4" />
                              Visualizar
                            </Button>
                            <Button size="sm" className="gap-1">
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
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
        onAdd={handleAddMaterial}
      />
    </MainLayout>
  );
};

export default Repositorio;
