import { supabase } from "@/integrations/supabase/client";

export interface ExpirationDate {
  date: string;
  label: string;
}

class ExpirationService {
  private cache = new Map<string, ExpirationDate[]>();

  async getExpirations(ticker: string): Promise<ExpirationDate[]> {
    // Check cache first
    if (this.cache.has(ticker)) {
      return this.cache.get(ticker)!;
    }

    try {
      // Try Supabase function invoke first
      const { data, error } = await supabase.functions.invoke('expirations', {
        body: { ticker }
      });
      
      if (error) {
        throw new Error(`Failed to fetch expirations: ${error.message}`);
      }
      
      this.cache.set(ticker, data);
      return data || [];
    } catch (supabaseError) {
      console.error('Supabase function failed, trying direct fetch:', supabaseError);
      
      try {
        // Fallback to direct fetch
        const response = await fetch(`https://uzcrxawacdipzzlpgfrn.supabase.co/functions/v1/expirations?ticker=${ticker}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6Y3J4YXdhY2RpcHp6bHBnZnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzU2NTMsImV4cCI6MjA3MzMxMTY1M30.1FzCjFARcfGwbGBQcl1dbgfn5p-FbVnEt2uOi_mrHFc`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const expirations = await response.json();
        this.cache.set(ticker, expirations);
        return expirations;
      } catch (error) {
        console.error('Failed to fetch expirations from API:', error);
        throw error;
      }
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const expirationService = new ExpirationService();