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

    // Step 1: Insert all NMSDs (nucleos_microrregionais)
    const nucleosToInsert = data.microrregioes.map((micro) => ({
      microregiao: micro.microrregiao.toUpperCase().trim(),
      cod_micro: String(micro.codigo_micro),
      macrorregiao: micro.macrorregiao.toUpperCase().trim(),
      cod_macro: String(micro.codigo_macro),
      urs: micro.urs.trim(),
      nome_nucleo: `NMSD ${micro.microrregiao}`,
      is_active: true,
    }));

    // Upsert nucleos (update if exists, insert if not)
    const { data: insertedNucleos, error: nucleosError } = await supabase
      .from("nucleos_microrregionais")
      .upsert(nucleosToInsert, { 
        onConflict: "cod_micro",
        ignoreDuplicates: false 
      })
      .select("id, microregiao, cod_micro");

    if (nucleosError) {
      console.error("Error inserting nucleos:", nucleosError);
      throw nucleosError;
    }

    console.log(`Inserted/Updated ${insertedNucleos?.length || 0} NMSDs`);

    // Create a map of cod_micro to nucleo_id
    const nucleoMap = new Map<string, string>();
    
    // Fetch all nucleos to build the map
    const { data: allNucleos } = await supabase
      .from("nucleos_microrregionais")
      .select("id, cod_micro, microregiao");
    
    allNucleos?.forEach((n) => {
      nucleoMap.set(n.cod_micro, n.id);
    });

    // Step 2: Insert all municipalities
    const municipiosToInsert: any[] = [];
    
    for (const micro of data.microrregioes) {
      const nucleoId = nucleoMap.get(String(micro.codigo_micro));
      
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

    // Insert in batches of 100 to avoid timeouts
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < municipiosToInsert.length; i += batchSize) {
      const batch = municipiosToInsert.slice(i, i + batchSize);
      
      const { data: inserted, error: munError } = await supabase
        .from("municipios")
        .upsert(batch, { 
          onConflict: "cod_ibge",
          ignoreDuplicates: false 
        })
        .select("id");

      if (munError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, munError);
        throw munError;
      }
      
      insertedCount += inserted?.length || 0;
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}, total: ${insertedCount}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed regionalization data`,
        stats: {
          nucleos_inserted: insertedNucleos?.length || 0,
          municipios_inserted: insertedCount,
          total_expected_nucleos: data.total_microrregioes,
          total_expected_municipios: data.total_municipios,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
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
