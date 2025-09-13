import { mockLeaderboards } from "@/lib/mockData";
import { User } from "@/utils/user-service";

export type LeaderboardRow = {
  rank: number;
  username: string;
  portfolioValue: number;
  pnl: number;
  pnlPercent: number;
  userId?: string;
};

const KEY = "customLeaderboards";

type LeagueBoards = Record<string, LeaderboardRow[]>;

function loadCustom(): LeagueBoards {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCustom(data: LeagueBoards) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function normalizeBase(rows: any[]): LeaderboardRow[] {
  return (rows || []).map((r: any) => ({
    rank: r.rank ?? 0,
    username: r.username,
    portfolioValue: r.portfolioValue,
    pnl: r.pnl,
    pnlPercent: r.pnlPercent,
    userId: r.userId,
  }));
}

function recomputeRanks(rows: LeaderboardRow[]): LeaderboardRow[] {
  const sorted = [...rows].sort((a, b) => b.portfolioValue - a.portfolioValue);
  return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
}

export const leaderboardService = {
  getLeaderboard(leagueId: string): LeaderboardRow[] {
    const base = normalizeBase((mockLeaderboards as any)[leagueId] || []);
    const custom = loadCustom();
    const extras = custom[leagueId] || [];
    return recomputeRanks([...base, ...extras]);
  },

  addPlayerToLeague(leagueId: string, user: User): LeaderboardRow {
    const custom = loadCustom();
    const league = custom[leagueId] || [];
    const exists = league.find((r) => r.userId === user.id);
    if (exists) return exists;
    const row: LeaderboardRow = {
      rank: 0,
      username: user.username,
      portfolioValue: 100000,
      pnl: 0,
      pnlPercent: 0,
      userId: user.id,
    };
    league.push(row);
    custom[leagueId] = league;
    saveCustom(custom);
    return row;
  },

  updatePlayerStats(leagueId: string, userId: string, updates: Partial<Omit<LeaderboardRow, "rank" | "username" | "userId">>) {
    const custom = loadCustom();
    const league = custom[leagueId] || [];
    const idx = league.findIndex((r) => r.userId === userId);
    if (idx >= 0) {
      const current = league[idx];
      league[idx] = { ...current, ...updates };
      custom[leagueId] = league;
      saveCustom(custom);
    }
  },

  isMember(leagueId: string, userId: string): boolean {
    const custom = loadCustom();
    const league = custom[leagueId] || [];
    return !!league.find((r) => r.userId === userId);
  }
};
