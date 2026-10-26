import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppFooter from "@/components/layout/AppFooter";

interface DocumentoInstitucionalProps {
  titulo: string;
}

const DocumentoInstitucional = ({ titulo }: DocumentoInstitucionalProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-xl border border-border bg-card p-8 text-center shadow-card">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">{titulo}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Este documento está em elaboração pela coordenação do NMSD e será publicado nesta página.
          </p>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar ao início
            </Link>
          </Button>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default DocumentoInstitucional;
