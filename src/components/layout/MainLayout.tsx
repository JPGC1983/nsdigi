import { useCallback, useEffect, useState } from "react";
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

const DESKTOP_QUERY = "(min-width: 1024px)";
const COLLAPSE_KEY = "nmsd-menu-recolhido";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_QUERY).matches : true,
  );
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const isDesktop = useIsDesktop();
  // Celular: menu começa fechado em toda página. Computador: lembra se a pessoa recolheu o menu.
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(COLLAPSE_KEY) === "1",
  );
  const { user, profileLoaded, isPending, isInactive } = useAuth();

  const sidebarOpen = isDesktop ? !desktopCollapsed : mobileOpen;

  const toggleSidebar = useCallback(() => {
    if (isDesktop) {
      setDesktopCollapsed((c) => {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
        return !c;
      });
    } else {
      setMobileOpen((o) => !o);
    }
  }, [isDesktop]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Fecha o menu do celular com a tecla Esc
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Cadastro ainda não aprovado (ou recusado): mostra apenas a situação do cadastro.
  if (user && profileLoaded && (isPending || isInactive)) {
    return <RegistrationStatusScreen />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <div className="flex w-full">
        <FloatingSidebar isOpen={sidebarOpen} isDesktop={isDesktop} onClose={closeMobile} />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <Header onMenuClick={toggleSidebar} menuOpen={sidebarOpen} />
          <motion.main
            id="conteudo"
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
