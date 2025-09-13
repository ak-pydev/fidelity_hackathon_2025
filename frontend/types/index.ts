// Trade types
export interface Trade {
  stock: string;
  type: 'call' | 'put';
  strike: number;
  premium: number;
  quantity: number;
}

// Portfolio types
export interface Portfolio {
  trades: Trade[];
  totalValue: number;
  totalPnL: number;
}

// League types
export interface League {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  portfolioValue: number;
  rank: number;
}

// Strategy types
export interface Strategy {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  rating: number;
  author: string;
}
