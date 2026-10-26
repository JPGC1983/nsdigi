import { ShieldOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NoPermissionProps {
  message?: string;
}

const NoPermission = ({ message = "Esta área é restrita a outros perfis de acesso." }: NoPermissionProps) => {
  const navigate = useNavigate();
  return (
    <div role="alert" className="flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-card py-16 px-6">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <ShieldOff className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">Você não tem permissão</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
      <Button variant="outline" onClick={() => navigate("/")}>
        Voltar ao início
      </Button>
    </div>
  );
};

export default NoPermission;
