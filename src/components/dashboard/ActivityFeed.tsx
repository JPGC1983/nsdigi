import { MessageSquare, GraduationCap, FileText, Users, Mail } from "lucide-react";
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

// Empty activities - will be populated from backend
const activities: Activity[] = [];

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
    navigate("/foruns");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl border border-border bg-white p-6 shadow-layered h-full min-h-[200px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground text-base">Atividades Recentes</h3>
        <button
          onClick={handleViewAll}
          className="text-xs text-primary font-medium hover:underline transition-all"
        >
          Ver todas
        </button>
      </div>
      
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <Mail className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Nenhuma atividade recente</p>
          <p className="text-xs text-muted-foreground/60">
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
