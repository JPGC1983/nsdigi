import { useState } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import FloatingSidebar from "./FloatingSidebar";
import AppFooter from "./AppFooter";
import { useAuth } from "@/hooks/useAuth";
import RegistrationStatusScreen from "@/components/auth/RegistrationStatusScreen";

interface MainLayoutProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, profileLoaded, isPending, isInactive } = useAuth();

  // Cadastro ainda não aprovado (ou recusado): mostra apenas a situação do cadastro.
  if (user && profileLoaded && (isPending || isInactive)) {
    return <RegistrationStatusScreen />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="flex w-full">
        <FloatingSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <motion.main
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 p-4 lg:p-6"
          >
            {children}
          </motion.main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
