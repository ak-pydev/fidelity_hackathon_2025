import { Trade } from "@/types";

// Mock stock data for dropdowns or default trades
export const mockStocks = [
  { ticker: "AAPL", price: 175 },
  { ticker: "TSLA", price: 250 },
  { ticker: "AMZN", price: 140 },
  { ticker: "MSFT", price: 330 },
  { ticker: "NFLX", price: 410 },
];

// Mock portfolio with some example trades
export const mockPortfolio: Trade[] = [
  {
    stock: "AAPL",
    type: "call" as const,
    strike: 180,
    premium: 5,
    quantity: 2,
  },
  {
    stock: "TSLA",
    type: "put" as const,
    strike: 240,
    premium: 8,
    quantity: 1,
  },
];