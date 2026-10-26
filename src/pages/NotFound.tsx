import { Link, useLocation } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  return (
    <MainLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Compass className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Página não encontrada</h1>
          <p className="mb-6 text-muted-foreground">
            O endereço <span className="font-mono text-sm break-all">{location.pathname}</span> não existe ou foi
            movido. Use o menu ao lado ou volte para o início.
          </p>
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Voltar para o Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
