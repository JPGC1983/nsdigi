import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Municipio {
  municipio: string;
  codigo_municipio: number;
}

interface Microrregiao {
  microrregiao: string;
  codigo_micro: number;
  macrorregiao: string;
  codigo_macro: number;
  urs: string;
  municipios: Municipio[];
}

interface RegionalizacaoData {
  total_microrregioes: number;
  total_municipios: number;
  microrregioes: Microrregiao[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the regionalization data from the request body
    const data: RegionalizacaoData = await req.json();
    
    console.log(`Processing ${data.total_microrregioes} microrregiões and ${data.total_municipios} municípios`);

    // Step 1: Fetch existing NMSDs to build a map (they are already seeded)
    const { data: allNucleos, error: fetchError } = await supabase
      .from("nucleos_microrregionais")
      .select("id, cod_micro, microregiao");
    
    if (fetchError) {
      console.error("Error fetching nucleos:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${allNucleos?.length || 0} existing NMSDs`);

    // Create a map of cod_micro to nucleo_id
    const nucleoMap = new Map<string, string>();
    allNucleos?.forEach((n) => {
      nucleoMap.set(n.cod_micro, n.id);
    });

    // Step 2: Prepare municipalities for insertion
    const municipiosToInsert: {
      municipio: string;
      cod_ibge: string;
      microregiao: string;
      cod_micro: string;
      macrorregiao: string;
      cod_macro: string;
      urs: string;
      nucleo_id: string | undefined;
      status: string;
    }[] = [];
    
    for (const micro of data.microrregioes) {
      const nucleoId = nucleoMap.get(String(micro.codigo_micro));
      
      if (!nucleoId) {
        console.warn(`NMSD not found for microregiao ${micro.microrregiao} (cod_micro: ${micro.codigo_micro})`);
      }
      
      for (const mun of micro.municipios) {
        municipiosToInsert.push({
          municipio: mun.municipio.trim(),
          cod_ibge: String(mun.codigo_municipio),
          microregiao: micro.microrregiao.toUpperCase().trim(),
          cod_micro: String(micro.codigo_micro),
          macrorregiao: micro.macrorregiao.toUpperCase().trim(),
          cod_macro: String(micro.codigo_macro),
          urs: micro.urs.trim(),
          nucleo_id: nucleoId,
          status: "pendente",
        });
      }
    }

    console.log(`Prepared ${municipiosToInsert.length} municipalities for insertion`);

    // Insert in batches of 100 to avoid timeouts
    const batchSize = 100;
    let insertedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < municipiosToInsert.length; i += batchSize) {
      const batch = municipiosToInsert.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      const { data: inserted, error: munError } = await supabase
        .from("municipios")
        .upsert(batch, { 
          onConflict: "cod_ibge",
          ignoreDuplicates: false 
        })
        .select("id");

      if (munError) {
        console.error(`Error in batch ${batchNumber}:`, munError);
        errors.push(`Batch ${batchNumber}: ${munError.message}`);
        continue; // Continue with next batch instead of failing completely
      }
      
      insertedCount += inserted?.length || 0;
      console.log(`Batch ${batchNumber} completed: ${inserted?.length || 0} municipalities processed (total: ${insertedCount})`);
    }

    // Final verification
    const { count: totalMunicipios } = await supabase
      .from("municipios")
      .select("*", { count: "exact", head: true });

    const { count: linkedMunicipios } = await supabase
      .from("municipios")
      .select("*", { count: "exact", head: true })
      .not("nucleo_id", "is", null);

    const response = {
      success: errors.length === 0,
      message: errors.length === 0 
        ? `Successfully processed regionalization data`
        : `Processed with ${errors.length} errors`,
      stats: {
        nmsd_existentes: allNucleos?.length || 0,
        municipios_processados: insertedCount,
        total_municipios_no_banco: totalMunicipios || 0,
        municipios_vinculados_nmsd: linkedMunicipios || 0,
        total_esperado: data.total_municipios,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("Final stats:", response.stats);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: errors.length === 0 ? 200 : 207,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error processing regionalization:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
