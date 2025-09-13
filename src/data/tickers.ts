export interface TickerData {
  name: string;
  ticker: string;
}

export interface TickerCategories {
  [category: string]: TickerData[];
}

export const TICKER_CATEGORIES: TickerCategories = {
  "Technology & Innovation": [
    { "name": "Apple", "ticker": "AAPL" },
    { "name": "Microsoft", "ticker": "MSFT" },
    { "name": "NVIDIA", "ticker": "NVDA" },
    { "name": "Advanced Micro Devices", "ticker": "AMD" },
    { "name": "Alphabet (Google)", "ticker": "GOOGL" },
    { "name": "Meta Platforms", "ticker": "META" }
  ],
  "Money & Banking": [
    { "name": "JPMorgan Chase", "ticker": "JPM" },
    { "name": "Bank of America", "ticker": "BAC" },
    { "name": "Goldman Sachs", "ticker": "GS" },
    { "name": "Morgan Stanley", "ticker": "MS" },
    { "name": "Citigroup", "ticker": "C" }
  ],
  "Health & Medicine": [
    { "name": "Johnson & Johnson", "ticker": "JNJ" },
    { "name": "Pfizer", "ticker": "PFE" },
    { "name": "UnitedHealth Group", "ticker": "UNH" },
    { "name": "Merck & Co.", "ticker": "MRK" },
    { "name": "Eli Lilly", "ticker": "LLY" }
  ],
  "Everyday Essentials": [
    { "name": "Procter & Gamble", "ticker": "PG" },
    { "name": "Coca-Cola", "ticker": "KO" },
    { "name": "Walmart", "ticker": "WMT" },
    { "name": "PepsiCo", "ticker": "PEP" },
    { "name": "Costco", "ticker": "COST" }
  ],
  "Cars & Shopping": [
    { "name": "Tesla", "ticker": "TSLA" },
    { "name": "Amazon", "ticker": "AMZN" },
    { "name": "Home Depot", "ticker": "HD" },
    { "name": "Nike", "ticker": "NKE" },
    { "name": "McDonald's", "ticker": "MCD" }
  ],
  "Energy & Oil": [
    { "name": "Exxon Mobil", "ticker": "XOM" },
    { "name": "Chevron", "ticker": "CVX" },
    { "name": "ConocoPhillips", "ticker": "COP" },
    { "name": "Schlumberger", "ticker": "SLB" },
    { "name": "BP", "ticker": "BP" }
  ],
  "Planes, Trains & Industry": [
    { "name": "Caterpillar", "ticker": "CAT" },
    { "name": "Boeing", "ticker": "BA" },
    { "name": "General Electric", "ticker": "GE" },
    { "name": "Honeywell", "ticker": "HON" },
    { "name": "Union Pacific", "ticker": "UNP" }
  ],
  "Utilities & Power": [
    { "name": "NextEra Energy", "ticker": "NEE" },
    { "name": "Duke Energy", "ticker": "DUK" },
    { "name": "Southern Company", "ticker": "SO" },
    { "name": "Exelon", "ticker": "EXC" },
    { "name": "American Electric Power", "ticker": "AEP" }
  ],
  "Materials & Resources": [
    { "name": "Linde", "ticker": "LIN" },
    { "name": "Newmont Corporation", "ticker": "NEM" },
    { "name": "Air Products & Chemicals", "ticker": "APD" },
    { "name": "Sherwin-Williams", "ticker": "SHW" },
    { "name": "DuPont", "ticker": "DD" }
  ],
  "Market Movers (ETFs)": [
    { "name": "SPDR S&P 500 ETF", "ticker": "SPY" },
    { "name": "Invesco QQQ Trust", "ticker": "QQQ" },
    { "name": "SPDR Dow Jones Industrial Average ETF", "ticker": "DIA" },
    { "name": "iShares Russell 2000 ETF", "ticker": "IWM" },
    { "name": "Technology Select Sector SPDR", "ticker": "XLK" },
    { "name": "Financial Select Sector SPDR", "ticker": "XLF" },
    { "name": "Health Care Select Sector SPDR", "ticker": "XLV" }
  ]
};

// Get all tickers as a flat array for easy searching
export const getAllTickers = (): TickerData[] => {
  return Object.values(TICKER_CATEGORIES).flat();
};

// Find ticker data by ticker symbol
export const findTickerBySymbol = (ticker: string): TickerData | undefined => {
  return getAllTickers().find(t => t.ticker.toLowerCase() === ticker.toLowerCase());
};