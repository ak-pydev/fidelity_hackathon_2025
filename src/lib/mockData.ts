import { Trade } from "@/types";

// Mock stock data for dropdowns or default trades
export const mockStocks = [
  { ticker: "AAPL", price: 175 },
  { ticker: "TSLA", price: 250 },
  { ticker: "AMZN", price: 140 },
  { ticker: "MSFT", price: 330 },
  { ticker: "NFLX", price: 410 },
  { ticker: "GOOGL", price: 135 },
  { ticker: "META", price: 320 },
  { ticker: "NVDA", price: 420 },
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
  {
    stock: "MSFT",
    type: "call" as const,
    strike: 340,
    premium: 12,
    quantity: 3,
  },
];

// Mock leagues data
export const mockLeagues = [
  {
    id: '1',
    name: 'Options Trading Masters',
    description: 'Advanced options strategies competition for experienced traders',
    memberCount: 15,
    maxMembers: 20,
    startDate: '2025-01-15',
    endDate: '2025-03-15',
    isActive: true,
    prize: '$1,000',
    createdBy: 'Michael Chen',
    joinCode: 'OTM2025',
    isPrivate: false,
  },
  {
    id: '2',
    name: 'Beginner Friendly League',
    description: 'Learn options trading basics with friends in a supportive environment',
    memberCount: 8,
    maxMembers: 15,
    startDate: '2025-02-01',
    endDate: '2025-04-01',
    isActive: true,
    prize: '$500',
    createdBy: 'Sarah Williams',
    joinCode: 'BFL2025',
    isPrivate: false,
  },
  {
    id: '3',
    name: 'Tech Stocks Only',
    description: 'Focus exclusively on technology sector options trading',
    memberCount: 12,
    maxMembers: 15,
    startDate: '2025-01-20',
    endDate: '2025-03-20',
    isActive: true,
    prize: '$750',
    createdBy: 'Alex Kumar',
    joinCode: 'TECH25',
    isPrivate: false,
  },
  {
    id: '4',
    name: 'Weekend Warriors',
    description: 'Casual trading league for weekend enthusiasts',
    memberCount: 6,
    maxMembers: 12,
    startDate: '2025-02-15',
    endDate: '2025-04-15',
    isActive: true,
    prize: '$300',
    createdBy: 'Jamie Rodriguez',
    joinCode: 'WKND25',
    isPrivate: false,
  },
  {
    id: '5',
    name: 'High Volatility Heroes',
    description: 'For traders who thrive in volatile market conditions',
    memberCount: 10,
    maxMembers: 20,
    startDate: '2025-02-01',
    endDate: '2025-03-31',
    isActive: true,
    prize: '$800',
    createdBy: 'Morgan Davis',
    joinCode: 'VOLHERO',
    isPrivate: false,
  },
];

// Mock leaderboard data for different leagues
export const mockLeaderboards = {
  '1': [
    { rank: 1, username: 'TradeMaster2024', portfolioValue: 125430, pnl: 25430, pnlPercent: 25.43, userId: 'u1' },
    { rank: 2, username: 'OptionsGuru', portfolioValue: 118750, pnl: 18750, pnlPercent: 18.75, userId: 'u2' },
    { rank: 3, username: 'VolatilityKing', portfolioValue: 112340, pnl: 12340, pnlPercent: 12.34, userId: 'u3' },
    { rank: 4, username: 'SpreadMaster', portfolioValue: 108900, pnl: 8900, pnlPercent: 8.90, userId: 'u4' },
    { rank: 5, username: 'IronCondorPro', portfolioValue: 105670, pnl: 5670, pnlPercent: 5.67, userId: 'u5' },
    { rank: 6, username: 'CallKnight', portfolioValue: 102340, pnl: 2340, pnlPercent: 2.34, userId: 'u6' },
    { rank: 7, username: 'PutPrincess', portfolioValue: 99780, pnl: -220, pnlPercent: -0.22, userId: 'u7' },
  ],
  '2': [
    { rank: 1, username: 'NewbiePro', portfolioValue: 108500, pnl: 8500, pnlPercent: 8.50, userId: 'u8' },
    { rank: 2, username: 'LearningFast', portfolioValue: 106200, pnl: 6200, pnlPercent: 6.20, userId: 'u9' },
    { rank: 3, username: 'FirstTimer', portfolioValue: 104800, pnl: 4800, pnlPercent: 4.80, userId: 'u10' },
    { rank: 4, username: 'CautiousTrader', portfolioValue: 102100, pnl: 2100, pnlPercent: 2.10, userId: 'u11' },
    { rank: 5, username: 'SafePlayer', portfolioValue: 101300, pnl: 1300, pnlPercent: 1.30, userId: 'u12' },
  ],
  '3': [
    { rank: 1, username: 'TechBull', portfolioValue: 132000, pnl: 32000, pnlPercent: 32.00, userId: 'u13' },
    { rank: 2, username: 'SiliconValley', portfolioValue: 124500, pnl: 24500, pnlPercent: 24.50, userId: 'u14' },
    { rank: 3, username: 'FAANGFan', portfolioValue: 119200, pnl: 19200, pnlPercent: 19.20, userId: 'u15' },
    { rank: 4, username: 'CloudChaser', portfolioValue: 115800, pnl: 15800, pnlPercent: 15.80, userId: 'u16' },
    { rank: 5, username: 'AIInvestor', portfolioValue: 111400, pnl: 11400, pnlPercent: 11.40, userId: 'u17' },
  ],
} as const;

// Mock strategies for marketplace
export const mockStrategies = [
  {
    id: '1',
    name: 'Iron Condor Mastery',
    description: 'Learn to profit from low volatility markets with iron condor spreads. Master entry and exit timing.',
    category: 'Neutral Strategies',
    difficulty: 'Intermediate' as const,
    price: 29.99,
    rating: 4.8,
    author: 'Michael Chen',
    students: 1234,
    lessons: 12,
    duration: '3 hours',
  },
  {
    id: '2',
    name: 'Covered Call Income Strategy',
    description: 'Generate consistent monthly income using covered call strategies on dividend stocks.',
    category: 'Income Strategies',
    difficulty: 'Beginner' as const,
    price: 19.99,
    rating: 4.9,
    author: 'Sarah Williams',
    students: 2156,
    lessons: 8,
    duration: '2 hours',
  },
  {
    id: '3',
    name: 'Advanced Volatility Trading',
    description: 'Master complex volatility strategies including straddles, strangles, and butterfly spreads.',
    category: 'Advanced Strategies',
    difficulty: 'Advanced' as const,
    price: 49.99,
    rating: 4.7,
    author: 'David Rodriguez',
    students: 789,
    lessons: 18,
    duration: '5 hours',
  },
  {
    id: '4',
    name: 'Bull Call and Put Spreads',
    description: 'Optimize your directional trades with bull and bear spread strategies.',
    category: 'Directional Strategies',
    difficulty: 'Intermediate' as const,
    price: 24.99,
    rating: 4.6,
    author: 'Lisa Johnson',
    students: 1567,
    lessons: 10,
    duration: '2.5 hours',
  },
  {
    id: '5',
    name: 'Earnings Play Strategies',
    description: 'Profit from earnings announcements with strategic options positioning.',
    category: 'Event-Based Strategies',
    difficulty: 'Advanced' as const,
    price: 39.99,
    rating: 4.5,
    author: 'Robert Kim',
    students: 932,
    lessons: 14,
    duration: '4 hours',
  },
  {
    id: '6',
    name: 'Risk Management Essentials',
    description: 'Learn proper position sizing, stop losses, and portfolio protection techniques.',
    category: 'Risk Management',
    difficulty: 'Beginner' as const,
    price: 22.99,
    rating: 4.9,
    author: 'Jennifer Adams',
    students: 1891,
    lessons: 9,
    duration: '2 hours',
  },
];

// Mock user data
export const mockUsers = [
  {
    id: 'current-user',
    username: 'YourUsername',
    email: 'you@example.com',
    portfolioValue: 103500,
    totalPnL: 3500,
    winRate: 68,
    totalTrades: 45,
    joinedLeagues: ['1', '2'],
    completedCourses: ['2', '6'],
  },
];

// Helper function to get league by ID
export const getLeagueById = (id: string) => {
  return mockLeagues.find(league => league.id === id);
};

// Helper function to get leaderboard by league ID
export const getLeaderboardByLeagueId = (leagueId: string) => {
  return mockLeaderboards[leagueId as keyof typeof mockLeaderboards] || [];
};

// Helper function to get strategy by ID
export const getStrategyById = (id: string) => {
  return mockStrategies.find(strategy => strategy.id === id);
};