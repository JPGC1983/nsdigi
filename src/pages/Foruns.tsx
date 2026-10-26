import { useState } from "react";
import { MessagesSquare, Plus } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useForums } from "@/hooks/useForums";
import ForumCard from "@/components/forums/ForumCard";
import AddForumModal from "@/components/modals/AddForumModal";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Foruns = () => {
  const [activeTab, setActiveTab] = useState("foruns");
  const { forums, loading, error, refetch } = useForums();
  const { isAdmin } = useAuth();
  const [isAddForumOpen, setIsAddForumOpen] = useState(false);

  const totalTopics = forums.reduce((acc, f) => acc + f.topics_count, 0);
  const totalMembers = forums.reduce((acc, f) => acc + f.members_count, 0);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Fóruns de Discussão"
          description="Comunidade de prática para troca de experiências e suporte mútuo"
          breadcrumbs={[{ label: "Fóruns de Discussão" }]}
          action={isAdmin ? { label: "Criar fórum", icon: Plus, onClick: () => setIsAddForumOpen(true) } : undefined}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Fóruns Ativos</p>
            <p className="text-2xl font-bold text-foreground">{forums.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total de Tópicos</p>
            <p className="text-2xl font-bold text-foreground">{totalTopics}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Participantes</p>
            <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Tempo Médio Resposta</p>
            <p className="text-2xl font-bold text-muted-foreground">--</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="foruns">Fóruns Temáticos</TabsTrigger>
            <TabsTrigger value="recentes">Discussões Recentes</TabsTrigger>
            <TabsTrigger value="especialistas">Hall da Fama</TabsTrigger>
          </TabsList>

          <TabsContent value="foruns" className="mt-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div role="alert" className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="font-medium text-foreground mb-1">Não foi possível carregar os fóruns</p>
                <p className="text-sm text-muted-foreground mb-4">Verifique sua conexão e tente novamente.</p>
                <Button variant="outline" onClick={() => refetch()}>Tentar novamente</Button>
              </div>
            ) : forums.length === 0 ? (
              <EmptyState
                icon={MessagesSquare}
                title="Nenhum fórum criado"
                description={
                  isAdmin
                    ? "Crie o primeiro fórum temático para os profissionais trocarem experiências e tirarem dúvidas."
                    : "Os fóruns temáticos ainda não foram criados pela coordenação. Volte em breve."
                }
                actionLabel={isAdmin ? "Criar primeiro fórum" : undefined}
                onAction={isAdmin ? () => setIsAddForumOpen(true) : undefined}
              />
            ) : (
              <div className="space-y-4">
                {forums.map((forum) => (
                  <ForumCard key={forum.id} forum={forum} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recentes" className="mt-4">
            <EmptyState
              icon={MessagesSquare}
              title="Nenhuma discussão recente"
              description="Escolha um fórum temático e abra a primeira discussão. As mais recentes de todos os fóruns aparecerão aqui."
              actionLabel="Ver fóruns temáticos"
              onAction={() => setActiveTab("foruns")}
            />
          </TabsContent>

          <TabsContent value="especialistas" className="mt-4">
            <EmptyState
              icon={MessagesSquare}
              title="Hall da Fama"
              description="Os profissionais com as melhores contribuições nos fóruns serão reconhecidos aqui. Participe respondendo às discussões."
              actionLabel="Participar dos fóruns"
              onAction={() => setActiveTab("foruns")}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AddForumModal
        open={isAddForumOpen}
        onOpenChange={setIsAddForumOpen}
        onAdd={() => refetch()}
      />
    </MainLayout>
  );
};

export default Foruns;
