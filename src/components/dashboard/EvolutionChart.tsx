import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

// Empty data - will be populated from backend
const data: { month: string; municipios: number; cursos: number; foruns: number }[] = [];

const EvolutionChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <h3 className="font-semibold text-foreground mb-4">Evolução da Plataforma</h3>
      {data.length === 0 ? (
        <div className="h-[280px] w-full flex flex-col items-center justify-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum dado de evolução disponível</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Os dados aparecerão conforme a plataforma for utilizada
          </p>
        </div>
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="municipios" 
                name="Municípios Ativos"
                stroke="#1B7D4B" 
                strokeWidth={2.5}
                dot={{ fill: '#1B7D4B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#1B7D4B' }}
              />
              <Line 
                type="monotone" 
                dataKey="cursos" 
                name="Cursos Concluídos"
                stroke="#2563EB" 
                strokeWidth={2.5}
                dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#2563EB' }}
              />
              <Line 
                type="monotone" 
                dataKey="foruns" 
                name="Tópicos Fórum"
                stroke="#0D9488" 
                strokeWidth={2.5}
                dot={{ fill: '#0D9488', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#0D9488' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default EvolutionChart;
