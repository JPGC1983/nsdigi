import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden group"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 hero-pattern" />
      
      {/* Content */}
      <div className="relative h-[200px] flex items-center px-8 lg:px-12">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl font-bold text-primary-foreground mb-2 tracking-tight"
          >
            Núcleo Microrregional de Saúde Digital
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-primary-foreground/80 text-sm font-normal mb-5 max-w-md"
          >
            Plataforma integrada para educação permanente e transformação digital do SUS.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button
              onClick={() => navigate("/municipios")}
              className="bg-card text-primary hover:bg-card/90 border-0 px-5 py-2.5 h-auto text-sm font-medium rounded-md shadow-sm gap-2"
            >
              Explorar Microrregiões
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroBanner;
