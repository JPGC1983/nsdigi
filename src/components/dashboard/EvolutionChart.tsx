import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

// Mock data for evolution chart
const data = [
  { month: "Jan", municipios: 12, cursos: 45, foruns: 28 },
  { month: "Fev", municipios: 15, cursos: 52, foruns: 35 },
  { month: "Mar", municipios: 18, cursos: 61, foruns: 42 },
  { month: "Abr", municipios: 22, cursos: 78, foruns: 55 },
  { month: "Mai", municipios: 25, cursos: 89, foruns: 68 },
  { month: "Jun", municipios: 28, cursos: 102, foruns: 78 },
];

const EvolutionChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <h3 className="font-semibold text-foreground mb-4">Evolução da Plataforma</h3>
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
    </motion.div>
  );
};

export default EvolutionChart;
