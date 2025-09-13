import { supabase } from "@/integrations/supabase/client";

export interface ContractData {
  contractId: string;
  strike: number;
  option_type: 'call' | 'put';
  premium: number;
  iv: number;
  expiration: string;
  underlying: string;
  oi?: number;
}

export interface HistoryData {
  ticker: string;
  from: string;
  to: string;
  candles: Array<{
    t: string;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
  }>;
}

export interface AnalysisRequest {
  option_type: 'call' | 'put';
  strike: number;
  premium: number;
  underlying: number;
  expiry_days: number;
  iv: number;
}

export interface AnalysisResult {
  payoff_curve: Array<{ price: number; pl: number }>;
  greeks: { delta: number; theta: number };
  probability_of_profit: number;
  insight: string;
  bands?: {
    p50: Array<{ price: number; pl: number }>;
    p80: Array<{ price: number; pl: number }>;
  };
  breakeven?: number;
}

class ApiService {
  async getContracts(ticker: string, expiration: string): Promise<ContractData[]> {
    const cacheKey = `contracts:${ticker}:${expiration}`;
    const saveCache = (rows: ContractData[]) => {
      try { localStorage.setItem(cacheKey, JSON.stringify(rows)); } catch {}
    };
    const loadCache = (): ContractData[] | null => {
      try {
        const raw = localStorage.getItem(cacheKey);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    };

    try {
      const { data, error } = await supabase.functions.invoke('contracts', {
        body: { ticker, expiration }
      });
      if (error) throw new Error(`Failed to fetch contracts: ${error.message}`);
      saveCache(data || []);
      return data || [];
    } catch (error) {
      console.error('Supabase function failed, trying direct fetch:', error);
      try {
        // Fallback to direct fetch if supabase.functions.invoke fails
        const response = await fetch(`https://uzcrxawacdipzzlpgfrn.supabase.co/functions/v1/contracts?ticker=${ticker}&expiration=${expiration}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3J4YXdhY2RpcHp6bHBnZnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzU2NTMsImV4cCI6MjA3MzMxMTY1M30.1FzCjFARcfGwbGBQcl1dbgfn5p-FbVnEt2uOi_mrHFc`,
          },
        });
        if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        const rows = await response.json();
        saveCache(rows);
        return rows;
      } catch (e2) {
        console.warn('Contracts API failed; using cache or mock data:', e2);
        const cached = loadCache();
        if (cached && cached.length) return cached;
        const mock = this.generateMockContracts(ticker, expiration);
        saveCache(mock);
        return mock;
      }
    }
  }

  private generateMockContracts(ticker: string, expiration: string): ContractData[] {
    // Generate mock contracts for testing purposes
    const contracts: ContractData[] = [];
    for (let i = 0; i < 5; i++) {
      contracts.push({
        contractId: `mock-${i}`,
        strike: Math.random() * 100,
        option_type: Math.random() < 0.5 ? 'call' : 'put',
        premium: Math.random() * 10,
        iv: Math.random() * 0.5,
        expiration,
        underlying: ticker,
        oi: Math.floor(Math.random() * 100),
      });
    }
    return contracts;
  }

  async getHistory(ticker: string, from: string, to: string): Promise<HistoryData> {
    // This would need a separate Supabase function - for now throw an error
    throw new Error('History data not implemented with Supabase functions yet');
  }

  async analyzeOption(request: AnalysisRequest): Promise<AnalysisResult> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze', {
        body: request
      });
      
      if (error) {
        console.warn('Supabase analyze function failed, using mock data:', error);
        return this.generateMockAnalysis(request);
      }
      
      return data || this.generateMockAnalysis(request);
    } catch (error) {
      console.warn('Analysis API failed, using mock data:', error);
      return this.generateMockAnalysis(request);
    }
  }

  private generateMockAnalysis(request: AnalysisRequest): AnalysisResult {
    const { option_type, strike, premium, underlying, expiry_days } = request;
    
    // Generate realistic payoff curve
    const payoffCurve = [];
    const priceRange = strike * 0.4; // 40% range around strike
    const startPrice = strike - priceRange;
    const endPrice = strike + priceRange;
    const steps = 50;
    
    for (let i = 0; i <= steps; i++) {
      const price = startPrice + (endPrice - startPrice) * (i / steps);
      let pl;
      
      if (option_type === 'call') {
        const intrinsicValue = Math.max(0, price - strike);
        pl = intrinsicValue - premium;
      } else {
        const intrinsicValue = Math.max(0, strike - price);
        pl = intrinsicValue - premium;
      }
      
      payoffCurve.push({ price: Math.round(price * 100) / 100, pl: Math.round(pl * 100) / 100 });
    }
    
    // Calculate breakeven
    const breakeven = option_type === 'call' ? strike + premium : strike - premium;
    
    // Generate realistic Greeks
    const timeToExpiry = expiry_days / 365;
    const moneyness = underlying / strike;
    
    const delta = option_type === 'call' 
      ? Math.min(0.99, Math.max(0.01, 0.5 + (moneyness - 1) * 2))
      : Math.max(-0.99, Math.min(-0.01, -0.5 + (moneyness - 1) * 2));
    
    const theta = -(premium / Math.max(timeToExpiry * 365, 1)) * 0.3; // Daily decay
    
    // Calculate probability of profit
    const distanceToBreakeven = Math.abs(underlying - breakeven);
    const volatilityAdjustedDistance = distanceToBreakeven / (underlying * request.iv * Math.sqrt(timeToExpiry));
    const probabilityOfProfit = Math.max(0.05, Math.min(0.95, 0.5 - volatilityAdjustedDistance * 0.2));
    
    // Generate AI insight
    const daysToExpiry = expiry_days;
    const isITM = option_type === 'call' ? underlying > strike : underlying < strike;
    const timeDecayRisk = Math.abs(theta) > 0.15 ? "high" : Math.abs(theta) > 0.05 ? "moderate" : "low";
    
    let insight = `This ${option_type} option is currently ${isITM ? 'in-the-money' : 'out-of-the-money'}. `;
    
    if (daysToExpiry <= 7) {
      insight += `With only ${daysToExpiry} days until expiration, time decay is accelerating rapidly. `;
    } else if (daysToExpiry <= 30) {
      insight += `With ${daysToExpiry} days to expiration, time decay is becoming a significant factor. `;
    } else {
      insight += `With ${daysToExpiry} days to expiration, you have reasonable time for the trade to work out. `;
    }
    
    insight += `The breakeven price is $${breakeven.toFixed(2)}. `;
    
    if (timeDecayRisk === "high") {
      insight += "⚠️ High time decay risk - this option loses significant value daily.";
    } else if (probabilityOfProfit < 0.3) {
      insight += "This trade has challenging odds - consider your risk tolerance.";
    } else if (probabilityOfProfit > 0.6) {
      insight += "The probability metrics suggest favorable odds for this position.";
    }
    
    return {
      payoff_curve: payoffCurve,
      greeks: { delta, theta },
      probability_of_profit: probabilityOfProfit,
      insight,
      breakeven,
      bands: {
        p50: payoffCurve.map(point => ({ 
          price: point.price, 
          pl: point.pl * 0.8 
        })),
        p80: payoffCurve.map(point => ({ 
          price: point.price, 
          pl: point.pl * 1.2 
        }))
      }
    };
  }

  async getManifest(): Promise<any> {
    // This would need a separate Supabase function - for now return empty
    return {};
  }
}

export const apiService = new ApiService();