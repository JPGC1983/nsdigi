import { MessageSquare, GraduationCap, FileText, Users, Inbox, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Activity {
  id: string;
  type: "forum" | "course" | "document" | "meeting";
  title: string;
  description: string;
  time: string;
  user?: string;
  link: string;
}

// Mock data - will be populated from backend
const activities: Activity[] = [
  {
    id: "1",
    type: "forum",
    title: "Nova discussão em e-SUS AB",
    description: "Dúvida sobre sincronização de dados",
    time: "há 2 horas",
    user: "Dr. Carlos Silva",
    link: "/foruns/esus-ab",
  },
  {
    id: "2",
    type: "course",
    title: "Curso de RNDS concluído",
    description: "15 profissionais certificados",
    time: "há 4 horas",
    link: "/educacao",
  },
  {
    id: "3",
    type: "meeting",
    title: "Reunião do Colegiado",
    description: "Pauta: Metas do trimestre",
    time: "amanhã às 14h",
    link: "/governanca",
  },
  {
    id: "4",
    type: "document",
    title: "Novo material disponível",
    description: "Guia de implantação e-SUS",
    time: "há 1 dia",
    link: "/repositorio",
  },
];

const iconMap = {
  forum: MessageSquare,
  course: GraduationCap,
  document: FileText,
  meeting: Users,
};

const colorMap = {
  forum: "bg-info/10 text-info",
  course: "bg-primary/10 text-primary",
  document: "bg-accent/10 text-accent",
  meeting: "bg-warning/10 text-warning",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
  },
};

const ActivityFeed = () => {
  const navigate = useNavigate();

  const handleActivityClick = (link: string) => {
    navigate(link);
  };

  const handleViewAll = () => {
    // Navigate to forums page which has the most recent discussions
    navigate("/foruns");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl border border-border bg-card p-5 shadow-layered hover:shadow-layered-lg transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground text-sm">Atividades Recentes</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleViewAll}
          className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
        >
          Ver todas <ExternalLink className="h-3 w-3" />
        </motion.button>
      </div>
      
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            As atividades aparecerão aqui
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {activities.map((activity) => {
            const Icon = iconMap[activity.type];
            return (
              <motion.div
                key={activity.id}
                variants={itemVariants}
                whileHover={{ 
                  x: 4,
                  transition: { duration: 0.2 }
                }}
                onClick={() => handleActivityClick(activity.link)}
                className="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    colorMap[activity.type]
                  )}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {activity.time}
                    {activity.user && ` • ${activity.user}`}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ActivityFeed;
