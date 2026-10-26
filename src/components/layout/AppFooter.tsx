import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppFooterProps {
  className?: string;
}

const AppFooter = ({ className }: AppFooterProps) => {
  return (
    <footer
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-2 px-4 lg:px-6 py-4 border-t border-border text-xs text-muted-foreground",
        className
      )}
    >
      <p>NMSD – Saúde Digital Minas Gerais</p>
      <nav aria-label="Links institucionais" className="flex items-center gap-4">
        <Link
          to="/termo-de-uso"
          className="hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Termo de Uso
        </Link>
        <Link
          to="/politica-de-privacidade"
          className="hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Política de Privacidade
        </Link>
      </nav>
    </footer>
  );
};

export default AppFooter;
