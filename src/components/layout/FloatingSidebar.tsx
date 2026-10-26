import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  GraduationCap,
  FolderOpen,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  Activity,
  UserCheck,
  ClipboardCheck,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { canReviewRegistrations } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FloatingSidebarProps {
  isOpen: boolean;
  isDesktop: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Building2, label: "Municípios", path: "/municipios" },
  { icon: MessageSquare, label: "Fóruns", path: "/foruns" },
  { icon: UserCheck, label: "Mentorias", path: "/mentorias" },
  { icon: GraduationCap, label: "Educação", path: "/educacao" },
  { icon: FolderOpen, label: "Repositório", path: "/repositorio" },
  { icon: BarChart3, label: "Indicadores", path: "/indicadores" },
  { icon: Users, label: "Governança", path: "/governanca" },
];

const sidebarVariants = {
  closed: {
    x: -280,
    opacity: 0,
    transitionEnd: { visibility: "hidden" as const },
  },
  open: {
    x: 0,
    opacity: 1,
    visibility: "visible" as const,
  },
};

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

/** Quantidade de cadastros aguardando aprovação (só para quem aprova). */
const usePendingRegistrations = (enabled: boolean) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    supabase.rpc("list_registrations", { _status: "pendente" }).then(({ data }) => {
      if (active) setCount(data?.length ?? 0);
    });
    return () => {
      active = false;
    };
  }, [enabled]);
  return count;
};

const FloatingSidebar = ({ isOpen, isDesktop, onClose }: FloatingSidebarProps) => {
  const location = useLocation();
  const { roles } = useAuth();
  const canReview = canReviewRegistrations(roles);
  const pendingCount = usePendingRegistrations(canReview);
  const items = canReview
    ? [...navItems, { icon: ClipboardCheck, label: "Aprovações", path: "/aprovacoes" }]
    : navItems;
  // No computador os links não fecham o menu; no celular fecham ao navegar.
  const handleNavigate = isDesktop ? undefined : onClose;

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.2 }}
        aria-hidden={!isOpen}
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-[260px] lg:w-64 flex-shrink-0",
          "glass-sidebar border-r border-white/10",
          "lg:sticky lg:z-30",
          isDesktop && !isOpen && "hidden"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
            <NavLink to="/" onClick={handleNavigate} className="flex items-center gap-3" aria-label="Ir para o Dashboard">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
              >
                <Activity className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-tight">NMSD</span>
                <span className="text-[10px] text-white/60 uppercase tracking-wider">Microrregional</span>
              </div>
            </NavLink>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white/80 hover:text-white hover:bg-white/10"
              onClick={onClose}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav aria-label="Menu principal" className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {items.map((item, index) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-primary/20 text-sidebar-primary shadow-lg shadow-sidebar-primary/10"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        isActive && "text-sidebar-primary"
                      )} />
                      <span className="tracking-tight">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary"
                        />
                      )}
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 p-3">
            <NavLink
              to="/configuracoes"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Configurações</span>
            </NavLink>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default FloatingSidebar;