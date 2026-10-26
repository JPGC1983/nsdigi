import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface MunicipioOption {
  id: string;
  municipio: string;
  microregiao: string;
  urs: string;
}

export const useMunicipiosCadastro = () =>
  useQuery({
    queryKey: ["municipios-cadastro"],
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_municipios_cadastro");
      if (error) throw error;
      return (data || []) as MunicipioOption[];
    },
  });

interface MunicipioComboboxProps {
  id?: string;
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  "aria-describedby"?: string;
}

const MunicipioCombobox = ({ id, value, onChange, disabled, invalid, ...rest }: MunicipioComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { data: municipios = [], isLoading, isError, refetch } = useMunicipiosCadastro();

  const selected = useMemo(() => municipios.find((m) => m.id === value), [municipios, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          aria-describedby={rest["aria-describedby"]}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground", invalid && "border-destructive")}
        >
          <span className="truncate">
            {selected ? `${selected.municipio} – ${selected.microregiao}` : "Selecione seu município"}
          </span>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Digite o nome do município..." />
          <CommandList>
            {isError ? (
              <div className="p-4 text-center text-sm">
                <p className="text-muted-foreground mb-2">Não foi possível carregar os municípios.</p>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <>
                <CommandEmpty>Nenhum município encontrado.</CommandEmpty>
                <CommandGroup>
                  {municipios.map((m) => (
                    <CommandItem
                      key={m.id}
                      value={`${m.municipio} ${m.microregiao}`}
                      onSelect={() => {
                        onChange(m.id);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === m.id ? "opacity-100" : "opacity-0")} aria-hidden="true" />
                      <div className="flex flex-col">
                        <span>{m.municipio}</span>
                        <span className="text-xs text-muted-foreground">NMSD {m.microregiao} · {m.urs}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MunicipioCombobox;
