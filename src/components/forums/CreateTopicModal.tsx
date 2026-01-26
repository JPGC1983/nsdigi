import { useState } from "react";
import { Plus, HelpCircle, Lightbulb, MessageCircle, Megaphone } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Forum, ForumTag, ForumTopicType, TOPIC_TYPE_CONFIG } from "@/types/forum";

interface CreateTopicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forum: Forum;
  tags: ForumTag[];
  onSuccess?: () => void;
}

const topicTypeOptions: { value: ForumTopicType; icon: React.ReactNode; title: string; description: string }[] = [
  {
    value: "problem_solution",
    icon: <HelpCircle className="h-5 w-5" />,
    title: "Problema & Solução",
    description: "Tenho um problema técnico e preciso de ajuda",
  },
  {
    value: "best_practice",
    icon: <Lightbulb className="h-5 w-5" />,
    title: "Melhor Prática",
    description: "Quero compartilhar uma técnica ou solução que funcionou",
  },
  {
    value: "qa",
    icon: <MessageCircle className="h-5 w-5" />,
    title: "Pergunta & Resposta",
    description: "Tenho uma dúvida geral ou conceitual",
  },
  {
    value: "announcement",
    icon: <Megaphone className="h-5 w-5" />,
    title: "Anúncio",
    description: "Comunicação importante (apenas moderadores)",
  },
];

const CreateTopicModal = ({ open, onOpenChange, forum, tags, onSuccess }: CreateTopicModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topicType, setTopicType] = useState<ForumTopicType>("qa");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tagId]);
    } else {
      toast.error("Máximo de 5 tags por tópico");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Faça login para criar um tópico");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Preencha título e conteúdo");
      return;
    }

    try {
      setLoading(true);

      // Create topic
      const { data: topicData, error: topicError } = await supabase
        .from("forum_topics")
        .insert({
          forum_id: forum.id,
          author_id: user.id,
          title: title.trim(),
          content: content.trim(),
          topic_type: topicType,
          status: "open",
        })
        .select()
        .single();

      if (topicError) throw topicError;

      // Add tags if any
      if (selectedTags.length > 0) {
        const tagInserts = selectedTags.map(tagId => ({
          topic_id: topicData.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from("forum_topic_tags")
          .insert(tagInserts);

        if (tagsError) {
          console.error("Error adding tags:", tagsError);
        }
      }

      toast.success("Tópico criado com sucesso!");
      
      // Reset form
      setTitle("");
      setContent("");
      setTopicType("qa");
      setSelectedTags([]);
      
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error("Erro ao criar tópico: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: `${forum.color}15` }}
            >
              {forum.icon}
            </div>
            <div>
              <DialogTitle>Novo Tópico</DialogTitle>
              <DialogDescription>
                Criar discussão em {forum.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Topic Type */}
          <div className="space-y-3">
            <Label>Tipo de Discussão</Label>
            <RadioGroup value={topicType} onValueChange={(v) => setTopicType(v as ForumTopicType)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topicTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      topicType === option.value 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={option.value} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span style={{ color: TOPIC_TYPE_CONFIG[option.value].color }}>
                          {option.icon}
                        </span>
                        <span className="font-medium text-sm">{option.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Como resolver erro de sincronização no e-SUS AB?"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">{title.length}/200</p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                topicType === "problem_solution" 
                  ? "Descreva o problema, versão do sistema, passos para reproduzir..."
                  : topicType === "best_practice"
                  ? "Detalhe a técnica passo a passo, configurações, exemplos..."
                  : "Escreva sua pergunta ou conteúdo aqui..."
              }
              rows={6}
            />
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags (máx. 5)</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer transition-all"
                    style={selectedTags.includes(tag.id) ? { 
                      backgroundColor: tag.color,
                      borderColor: tag.color,
                    } : {}}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Tópico"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTopicModal;
