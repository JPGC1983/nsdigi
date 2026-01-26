import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineData {
  value: number;
}

interface SparklineCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: SparklineData[];
  delay?: number;
  className?: string;
}

const SparklineCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  sparklineData = [],
  delay = 0,
  className,
}: SparklineCardProps) => {
  const hasSparkline = sparklineData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)" }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-layered transition-all duration-300 cursor-default group",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.1, duration: 0.3 }}
                className="text-2xl font-bold text-foreground tracking-tight"
              >
                {value}
              </motion.span>
              {trend && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.2, duration: 0.3 }}
                  className={cn(
                    "flex items-center text-xs font-medium",
                    trend.isPositive ? "text-primary" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>
      )}

      {/* Sparkline */}
      {hasSparkline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.4 }}
          className="h-12 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Decorative gradient */}
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

export default SparklineCard;