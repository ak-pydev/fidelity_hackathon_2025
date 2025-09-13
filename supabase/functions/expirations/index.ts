import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Handle both query parameters and request body
    let ticker = url.searchParams.get('ticker');
    
    // If not in query params, try request body
    if (!ticker) {
      try {
        const body = await req.json();
        ticker = body.ticker || 'SPY';
      } catch {
        ticker = 'SPY';
      }
    }

    console.log(`Fetching expirations for ${ticker}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const polygonApiKey = Deno.env.get('POLYGON_API_KEY');
    if (!polygonApiKey) {
      throw new Error('POLYGON_API_KEY not configured');
    }

    // Try fetching expiration dates from Polygon Pro API
    try {
      const polygonUrl = `https://api.polygon.io/v3/reference/options/contracts?underlying_ticker=${ticker}&limit=100&apikey=${polygonApiKey}`;
      
      console.log('Fetching expirations from Polygon Pro API');
      const polygonResponse = await fetch(polygonUrl);
      
      if (polygonResponse.ok) {
        const polygonData = await polygonResponse.json();
        
        if (polygonData.status === 'OK' && polygonData.results) {
          // Extract unique expiration dates
          const uniqueExpirations = [...new Set(
            polygonData.results.map((contract: any) => contract.expiration_date)
          )].sort();
          
          // Format expirations
          const formattedExpirations = uniqueExpirations.slice(0, 10).map(date => ({
            date,
            label: new Date(date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })
          }));
          
          console.log(`Found ${formattedExpirations.length} expiration dates for ${ticker}`);
          
          return new Response(JSON.stringify(formattedExpirations), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      throw new Error(`Polygon API call failed: ${polygonResponse.status}`);
      
    } catch (polygonError) {
      console.warn('Polygon Pro API failed, using fallback expirations:', polygonError.message);
    }

    // Fallback to standard expiration dates
    const fallbackExpirations = [
      { date: "2024-10-18", label: "Fri, Oct 18, 2024" },
      { date: "2024-11-15", label: "Fri, Nov 15, 2024" },
      { date: "2024-12-20", label: "Fri, Dec 20, 2024" },
      { date: "2025-01-17", label: "Fri, Jan 17, 2025" },
      { date: "2025-03-21", label: "Fri, Mar 21, 2025" },
      { date: "2025-06-20", label: "Fri, Jun 20, 2025" }
    ];

    return new Response(JSON.stringify(fallbackExpirations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Expirations endpoint error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});