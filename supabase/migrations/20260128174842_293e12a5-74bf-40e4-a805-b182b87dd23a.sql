-- Create index for better query performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_municipios_microregiao ON public.municipios(microregiao);
CREATE INDEX IF NOT EXISTS idx_municipios_nucleo_id ON public.municipios(nucleo_id);
CREATE INDEX IF NOT EXISTS idx_nucleos_urs ON public.nucleos_microrregionais(urs);
CREATE INDEX IF NOT EXISTS idx_nucleos_macrorregiao ON public.nucleos_microrregionais(macrorregiao);