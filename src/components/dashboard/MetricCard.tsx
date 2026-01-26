import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  delay?: number;
}

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  delay = 0,
}: MetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl bg-white p-6 shadow-layered hover-lift card-accent-top cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="label-style mb-2">
            {title}
          </p>
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.1, duration: 0.3 }}
            className="text-[32px] font-bold text-foreground tracking-tight leading-none"
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
