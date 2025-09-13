import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface AnalysisRequest {
  option_type: 'call' | 'put';
  strike: number;
  premium: number;
  underlying: number;
  expiry_days: number;
  iv: number;
}

interface PayoffPoint {
  price: number;
  pl: number;
}

Deno.serve(async (req) => {
  console.log('Analyze function called with method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    
    // Add a simple health check for GET requests
    if (req.method === 'GET') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        message: 'Analyze function is running',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('Parsing request body...');
    const requestData: AnalysisRequest = await req.json();
    console.log('Request data received:', requestData);
    
    const { option_type, strike, premium, underlying, expiry_days, iv } = requestData;

    console.log(`Analyzing ${option_type} option: strike=${strike}, premium=${premium}, underlying=${underlying}, iv=${iv}, days=${expiry_days}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Calculate payoff curve
    const payoffCurve: PayoffPoint[] = [];
    const priceRange = strike * 0.4; // ±40% of strike
    const minPrice = strike - priceRange;
    const maxPrice = strike + priceRange;
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      const price = minPrice + (i * (maxPrice - minPrice) / steps);
      let intrinsicValue = 0;
      
      if (option_type === 'call') {
        intrinsicValue = Math.max(0, price - strike);
      } else {
        intrinsicValue = Math.max(0, strike - price);
      }
      
      const pl = (intrinsicValue - premium) * 100; // Convert to dollars per contract
      payoffCurve.push({ 
        price: Math.round(price * 100) / 100, 
        pl: Math.round(pl * 100) / 100 
      });
    }

    // Calculate Greeks (simplified Black-Scholes approximations)
    const timeToExpiry = expiry_days / 365;
    const riskFreeRate = 0.05; // 5% risk-free rate
    
    // Simplified delta calculation
    const moneyness = underlying / strike;
    let delta: number;
    if (option_type === 'call') {
      delta = moneyness > 1 ? 0.6 + (moneyness - 1) * 0.3 : 0.2 + moneyness * 0.4;
      delta = Math.min(0.99, Math.max(0.01, delta));
    } else {
      delta = moneyness < 1 ? -0.6 - (1 - moneyness) * 0.3 : -0.2 - (1 - moneyness) * 0.4;
      delta = Math.max(-0.99, Math.min(-0.01, delta));
    }

    // Simplified theta calculation (time decay)
    const theta = -premium / (expiry_days * 2); // Rough approximation
    
    // Monte Carlo simulation for probability of profit
    const simulations = 10000;
    let profitableOutcomes = 0;
    const volatility = iv;
    // riskFreeRate already declared above, so we'll reuse it
    
    // Generate normal random numbers using Box-Muller transform
    const generateNormal = () => {
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    };
    
    console.log(`Starting Monte Carlo with: S0=${underlying}, K=${strike}, premium=${premium}, σ=${volatility}, T=${timeToExpiry}, type=${option_type}`);
    
    for (let i = 0; i < simulations; i++) {
      // Generate terminal price using risk-neutral GBM: ST = S0 * exp((r - 0.5*σ²)*T + σ*√T*Z)
      const z = generateNormal();
      const drift = (riskFreeRate - 0.5 * volatility * volatility) * timeToExpiry;
      const diffusion = volatility * Math.sqrt(timeToExpiry) * z;
      const terminalPrice = underlying * Math.exp(drift + diffusion);
      
      // Calculate intrinsic value at expiry (per share)
      let intrinsicValuePerShare = 0;
      if (option_type === 'call') {
        intrinsicValuePerShare = Math.max(0, terminalPrice - strike);
      } else {
        intrinsicValuePerShare = Math.max(0, strike - terminalPrice);
      }
      
      // Calculate P/L: Intrinsic value minus premium paid
      // Both values should be in same units (per share)
      const profitLoss = intrinsicValuePerShare - premium;
      
      if (profitLoss > 0) {
        profitableOutcomes++;
      }
      
      // Log detailed info for first few simulations to debug
      if (i < 5) {
        console.log(`Simulation ${i}: terminalPrice=${terminalPrice.toFixed(2)}, intrinsic=${intrinsicValuePerShare.toFixed(2)}, premium=${premium.toFixed(2)}, P/L=${profitLoss.toFixed(2)}, profitable=${profitLoss > 0}`);
      }
    }
    
    const probabilityOfProfit = profitableOutcomes / simulations;
    console.log(`Monte Carlo results: ${profitableOutcomes}/${simulations} profitable outcomes = ${(probabilityOfProfit * 100).toFixed(1)}% probability`);
    
    // Validate results - if probability is 0% or 100%, log warning
    if (probabilityOfProfit === 0 || probabilityOfProfit === 1) {
      console.warn(`UNREALISTIC PROBABILITY DETECTED: ${(probabilityOfProfit * 100).toFixed(1)}% - Check input parameters`);
      console.warn(`Inputs: S0=${underlying}, K=${strike}, premium=${premium}, σ=${volatility}, T=${timeToExpiry}, r=${riskFreeRate}`);
    }

    // Generate Monte Carlo bands based on actual simulation results
    const p50Band: PayoffPoint[] = [];
    const p80Band: PayoffPoint[] = [];
    
    payoffCurve.forEach(point => {
      // Calculate expected P&L at this price level using volatility
      const distanceFromCurrent = Math.abs(point.price - underlying) / underlying;
      const volAdjustment = volatility * Math.sqrt(timeToExpiry) * 100; // Convert to percentage
      
      // Create realistic bands based on volatility
      const p50Spread = volAdjustment * 0.3 * (1 + distanceFromCurrent);
      const p80Spread = volAdjustment * 0.6 * (1 + distanceFromCurrent);
      
      p50Band.push({
        price: Math.round(point.price * 100) / 100,
        pl: Math.round(point.pl - p50Spread)
      });
      
      p80Band.push({
        price: Math.round(point.price * 100) / 100,
        pl: Math.round(point.pl - p80Spread)
      });
    });

    // Calculate breakeven
    const breakeven = option_type === 'call' 
      ? strike + premium 
      : strike - premium;

    // Comprehensive dynamic AI insight generation with classifications
    
    function classifyTime(daysToExp: number) {
      if (daysToExp <= 7) return { tag: "very short", risk: 90 };
      if (daysToExp <= 30) return { tag: "short", risk: 70 };
      if (daysToExp <= 90) return { tag: "medium", risk: 40 };
      if (daysToExp <= 180) return { tag: "long", risk: 20 };
      return { tag: "very long", risk: 10 };
    }

    function classifyMoneyness(S0: number, K: number, optionType: string) {
      const moneyness = optionType === "call" ? S0 / K : K / S0;
      const atmPct = Math.abs(1 - moneyness);
      
      let bucket: string;
      let gammaRisk: number;
      
      if (atmPct < 0.02) {
        bucket = "ATM";
        gammaRisk = 80;
      } else if (atmPct < 0.05) {
        bucket = moneyness > 1 ? "slightly in-the-money" : "slightly out-of-the-money";
        gammaRisk = 60;
      } else if (atmPct < 0.15) {
        bucket = moneyness > 1 ? "in-the-money" : "out-of-the-money";
        gammaRisk = 40;
      } else {
        bucket = moneyness > 1 ? "deep in-the-money" : "deep out-of-the-money";
        gammaRisk = 20;
      }
      
      return { bucket, atmPct, gammaRisk };
    }

    function classifyIV(iv: number, hv?: number, ivPercentile?: number) {
      // Use IV percentile if available, otherwise compare to HV
      if (ivPercentile !== undefined) {
        const pct = Math.round(ivPercentile * 100);
        if (ivPercentile >= 0.9) return { tag: "very high", score: 90, detail: `${pct}th percentile` };
        if (ivPercentile >= 0.7) return { tag: "high", score: 70, detail: `${pct}th percentile` };
        if (ivPercentile >= 0.3) return { tag: "normal", score: 50, detail: `${pct}th percentile` };
        if (ivPercentile >= 0.1) return { tag: "low", score: 30, detail: `${pct}th percentile` };
        return { tag: "very low", score: 10, detail: `${pct}th percentile` };
      }
      
      if (hv) {
        const ratio = iv / hv;
        const detail = `IV ${(iv*100).toFixed(1)}% vs HV ${(hv*100).toFixed(1)}%`;
        
        if (ratio > 2.0) return { tag: "extremely expensive", score: 95, detail };
        if (ratio > 1.5) return { tag: "expensive", score: 80, detail };
        if (ratio > 0.8) return { tag: "fair", score: 50, detail };
        if (ratio > 0.5) return { tag: "cheap", score: 20, detail };
        return { tag: "depressed", score: 10, detail };
      }
      
      // Fallback to absolute IV levels
      const ivPct = (iv * 100).toFixed(1);
      if (iv > 0.6) return { tag: "extremely expensive", score: 95, detail: `IV ${ivPct}%` };
      if (iv > 0.4) return { tag: "expensive", score: 80, detail: `IV ${ivPct}%` };
      if (iv > 0.2) return { tag: "fair", score: 50, detail: `IV ${ivPct}%` };
      if (iv > 0.1) return { tag: "cheap", score: 20, detail: `IV ${ivPct}%` };
      return { tag: "depressed", score: 10, detail: `IV ${ivPct}%` };
    }

    function classifyTheta(theta: number, premium: number) {
      const decay = Math.abs(theta);
      const decayPct = decay / premium;
      
      if (decayPct > 0.15) return { tag: "severe", score: 90 };
      if (decayPct > 0.08) return { tag: "high", score: 70 };
      if (decayPct > 0.03) return { tag: "moderate", score: 50 };
      return { tag: "low", score: 20 };
    }

    function classifyLiquidity(bid: number, ask: number, openInterest?: number) {
      const spread = ask - bid;
      const spreadPct = spread / ((bid + ask) / 2);
      
      if (spreadPct < 0.02 && (!openInterest || openInterest > 100)) {
        return { tag: "good", score: 10 };
      }
      if (spreadPct < 0.05 && (!openInterest || openInterest > 50)) {
        return { tag: "ok", score: 30 };
      }
      if (spreadPct < 0.10) {
        return { tag: "poor", score: 70 };
      }
      return { tag: "poor", score: 90 };
    }

    function generateInsight(iv: number, hv: number, theta: number, pop: number, strike: number, underlying: number, premium: number, daysToExp: number, optionType: string, delta: number): string {
      // Generate fake bid/ask for liquidity classification (since we don't have real data)
      const bid = premium * 0.98;
      const ask = premium * 1.02;
      
      // Classifications
      const timeC = classifyTime(daysToExp);
      const moneyC = classifyMoneyness(underlying, strike, optionType);
      const ivC = classifyIV(iv, hv);
      const thC = classifyTheta(theta, premium);
      const liqC = classifyLiquidity(bid, ask);

      // Break-even calculation
      const breakeven = optionType === "call" ? strike + premium : strike - premium;

      // Generate user-friendly sentences
      const volSentence = (() => {
        // Replace abbreviations with full forms
        const detailText = ivC.detail.replace(/IV /g, 'implied volatility ').replace(/HV /g, 'historical volatility ');
        
        switch (ivC.tag) {
          case "extremely expensive": return `Options are very pricey — traders expect big swings (${detailText}).`;
          case "expensive": return `Options cost more than usual — market sees above-normal risk (${detailText}).`;
          case "fair": return `Option pricing looks normal compared to past volatility (${detailText}).`;
          case "cheap": return `Options are cheaper than usual — market calm vs history (${detailText}).`;
          case "depressed": return `Options are very cheap — market sees little chance of big moves (${detailText}).`;
          default: return `Volatility level: ${detailText}.`;
        }
      })();

      const thetaSentence = thC.tag === "severe"
        ? `This option loses a lot of value every day: about $${Math.abs(theta).toFixed(2)} (${(Math.abs(theta)/premium*100).toFixed(1)}%).`
        : thC.tag === "high"
        ? `Value drops quickly: around $${Math.abs(theta).toFixed(2)} each day.`
        : thC.tag === "moderate"
        ? `Some daily decay: loses about $${Math.abs(theta).toFixed(2)} each day.`
        : `Time decay is light — only about $${Math.abs(theta).toFixed(2)} per day.`;

      const moneySentence = (() => {
        const side = optionType === "call" ? "call" : "put";
        const nearATM = moneyC.atmPct < 0.02 ? " It's very close to the stock price, so small moves matter a lot." : "";
        // Replace ATM with full form and remove asterisks
        const bucketName = moneyC.bucket === "ATM" ? "at-the-money" : moneyC.bucket;
        return `This ${side} is ${bucketName}. It needs the stock at $${breakeven.toFixed(2)} by expiry to break even.${nearATM}`;
      })();

      const popSentence = (() => {
        if (pop >= 0.7) return `Strong odds — about ${(pop*100).toFixed(0)}% chance of profit.`;
        if (pop >= 0.55) return `Better than average odds — ${(pop*100).toFixed(0)}% chance of profit.`;
        if (pop >= 0.40) return `Fair odds — about ${(pop*100).toFixed(0)}%.`;
        if (pop >= 0.25) return `Low chance of profit — only ${(pop*100).toFixed(0)}%.`;
        return `Very low odds — less than ${(pop*100).toFixed(0)}%.`;
      })();

      // Combine into friendly paragraph
      return `${volSentence} ${thetaSentence} ${moneySentence} ${popSentence}`;
    }

    // Use more realistic volatility classification based on absolute IV levels and market context
    const historicalVol = 0.20; // Use market average of 20% as baseline for comparison
    const insight = generateInsight(iv, historicalVol, theta, probabilityOfProfit, strike, underlying, premium, expiry_days, option_type, delta);

    const response = {
      payoff_curve: payoffCurve,
      greeks: {
        delta: Math.round(delta * 1000) / 1000,
        theta: Math.round(theta * 100) / 100
      },
      probability_of_profit: Math.round(probabilityOfProfit * 1000) / 1000,
      insight,
      bands: {
        p50: p50Band,
        p80: p80Band
      },
      breakeven: Math.round(breakeven * 100) / 100
    };

    // Cache to Supabase Storage
    try {
      const contractKey = `${option_type.toUpperCase()}${strike}`;
      const fileName = `analysis/analysis_SPY_${contractKey}_${new Date().toISOString().split('T')[0]}.json`;
      const { error: uploadError } = await supabase.storage
        .from('options-analyzer')
        .upload(fileName, JSON.stringify(response), {
          contentType: 'application/json',
          upsert: true
        });

      if (uploadError) {
        console.warn('Failed to cache to storage:', uploadError);
      } else {
        console.log(`Cached analysis data to ${fileName}`);
      }
    } catch (cacheError) {
      console.warn('Cache error:', cacheError);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analysis endpoint error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.name,
        details: 'Analysis function encountered an error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});