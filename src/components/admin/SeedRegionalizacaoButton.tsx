import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import regionalizacaoData from "@/data/mg_regionalizacao.json";

interface SeedResult {
  success: boolean;
  message?: string;
  stats?: {
    nucleos_inserted: number;
    municipios_inserted: number;
    total_expected_nucleos: number;
    total_expected_municipios: number;
  };
  error?: string;
}

const SeedRegionalizacaoButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("seed-regionalizacao", {
        body: regionalizacaoData,
      });

      if (error) {
        throw error;
      }

      setResult(data as SeedResult);
      
      if (data.success) {
        toast.success(`Sucesso! ${data.stats.nucleos_inserted} NMSDs e ${data.stats.municipios_inserted} municípios inseridos.`);
      } else {
        toast.error(`Erro: ${data.error}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult({ success: false, error: errorMessage });
      toast.error(`Erro ao popular dados: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            Popular Regionalização MG
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Insere as 89 microrregiões (NMSDs) e 853 municípios de Minas Gerais
            na base de dados.
          </p>

          {result && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                result.success
                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                  : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
              }`}
            >
              {result.success ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {result.stats?.nucleos_inserted} NMSDs e{" "}
                    {result.stats?.municipios_inserted} municípios inseridos
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{result.error}</span>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleSeed}
            disabled={isLoading}
            className="mt-4"
            variant="default"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Popular Base de Dados
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SeedRegionalizacaoButton;
