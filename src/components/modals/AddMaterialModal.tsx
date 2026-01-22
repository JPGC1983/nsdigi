import { useState, useRef } from "react";
import { 
  FolderOpen, 
  Upload, 
  FileText, 
  Video, 
  HelpCircle, 
  FileCode, 
  Scale,
  ExternalLink,
  X,
  File
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AddMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (data: MaterialData) => void;
}

export interface MaterialData {
  title: string;
  description: string;
  type: "video" | "manual" | "faq" | "template" | "legislacao";
  category: string;
  author: string;
  url: string;
  fileName?: string;
}

const types = [
  { value: "video", label: "Vídeo", icon: Video, color: "text-red-500" },
  { value: "manual", label: "Manual", icon: FileText, color: "text-blue-500" },
  { value: "faq", label: "FAQ", icon: HelpCircle, color: "text-amber-500" },
  { value: "template", label: "Template", icon: FileCode, color: "text-purple-500" },
  { value: "legislacao", label: "Legislação", icon: Scale, color: "text-emerald-500" },
];

const categories = [
  { value: "e-SUS", label: "e-SUS" },
  { value: "RNDS", label: "RNDS" },
  { value: "Telessaúde", label: "Telessaúde" },
  { value: "Gestão", label: "Gestão" },
  { value: "Legislação", label: "Legislação" },
  { value: "Interoperabilidade", label: "Interoperabilidade" },
];

const acceptedFormats = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.mp4,.mp3,.zip";

const AddMaterialModal = ({ open, onOpenChange, onAdd }: AddMaterialModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<MaterialData>({
    title: "",
    description: "",
    type: "manual",
    category: "",
    author: "",
    url: "",
    fileName: "",
  });
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Informe o título do material");
      return;
    }

    if (!formData.type) {
      toast.error("Selecione o tipo do material");
      return;
    }

    if (!formData.url.trim() && !formData.fileName) {
      toast.error("Informe uma URL ou anexe um arquivo");
      return;
    }

    onAdd?.(formData);
    toast.success(`Material "${formData.title}" adicionado com sucesso!`);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "manual",
      category: "",
      author: "",
      url: "",
      fileName: "",
    });
  };

  const handleFileSelect = (file: File) => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máximo permitido: 20MB");
      return;
    }

    setFormData({ 
      ...formData, 
      fileName: file.name,
      // In a real app, you would upload to storage and get URL back
      url: `file://${file.name}` 
    });
    toast.success(`Arquivo "${file.name}" selecionado`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, fileName: "", url: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectedType = types.find(t => t.value === formData.type);
  const TypeIcon = selectedType?.icon || FileText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Adicionar Material</DialogTitle>
              <DialogDescription>
                Envie um novo material para o repositório de conhecimento
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Título */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Título do Material <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Guia de implantação e-SUS APS"
              className="mt-1.5"
            />
          </div>

          {/* Tipo e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-sm font-medium">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: MaterialData["type"]) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${t.color}`} />
                          {t.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Autor */}
          <div>
            <Label htmlFor="author" className="text-sm font-medium">Autor / Fonte</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Nome do autor ou instituição"
              className="mt-1.5"
            />
          </div>

          {/* Área de Upload ou URL */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Arquivo ou Link <span className="text-destructive">*</span>
            </Label>
            
            {formData.fileName ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TypeIcon className={`h-5 w-5 ${selectedType?.color || "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {formData.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Arquivo selecionado
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                {/* Drag & Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                    transition-all duration-200 hover:border-primary/50 hover:bg-primary/5
                    ${isDragOver 
                      ? "border-primary bg-primary/10" 
                      : "border-border bg-muted/20"
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFormats}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className={`
                      h-12 w-12 rounded-full flex items-center justify-center
                      ${isDragOver ? "bg-primary/20" : "bg-muted"}
                    `}>
                      <Upload className={`h-6 w-6 ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Arraste um arquivo ou <span className="text-primary">clique para selecionar</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOC, XLS, PPT, MP4, MP3, ZIP (máx. 20MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-medium">ou insira um link</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* URL Input */}
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://exemplo.com/documento.pdf"
                    className="pl-10"
                  />
                </div>
              </>
            )}
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva brevemente o conteúdo do material..."
              rows={3}
              className="mt-1.5 resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <File className="h-4 w-4" />
              Adicionar Material
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaterialModal;
