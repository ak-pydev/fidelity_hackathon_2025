import { mockLeagues } from "@/lib/mockData";

export interface League {
  id: string;
  name: string;
  description: string;
  member_count: number;
  max_members: number;
  start_date: string;
  end_date: string;
  prize: string;
  is_active: boolean;
  created_at?: string;
  created_by?: string;
  join_code?: string;
  is_private?: boolean;
}

export interface CreateLeagueRequest {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  max_members: number;
  prize: string;
}

export interface JoinLeagueRequest {
  league_code: string;
  user_id?: string;
}

class LeagueService {
  // Local mock DB persisted to localStorage for demo
  private getDb(): League[] {
    try {
      const raw = localStorage.getItem('leaguesDb');
      if (raw) return JSON.parse(raw);
    } catch {}
    // Map root mockLeagues shape to this League interface if needed
    const seeded: League[] = mockLeagues.map((l: any) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      member_count: l.memberCount ?? l.member_count ?? 0,
      max_members: l.maxMembers ?? l.max_members ?? 10,
      start_date: l.startDate ?? l.start_date,
      end_date: l.endDate ?? l.end_date,
      prize: l.prize ?? '',
      is_active: l.isActive ?? l.is_active ?? true,
      created_at: l.created_at,
      created_by: l.createdBy ?? l.created_by,
      join_code: l.joinCode ?? l.join_code,
      is_private: l.isPrivate ?? l.is_private ?? false,
    }));
    this.saveDb(seeded);
    return seeded;
  }

  private saveDb(leagues: League[]) {
    localStorage.setItem('leaguesDb', JSON.stringify(leagues));
  }

  async getLeagues(): Promise<League[]> {
    return this.getDb();
  }

  async getLeague(id: string): Promise<League> {
    const leagues = this.getDb();
    const league = leagues.find(l => l.id === id);
    if (!league) throw new Error('League not found');
    return league;
  }

  async createLeague(request: CreateLeagueRequest): Promise<League> {
    const leagues = this.getDb();
    const newLeague: League = {
      id: Date.now().toString(),
      name: request.name,
      description: request.description,
      member_count: 1,
      max_members: request.max_members,
      start_date: request.start_date,
      end_date: request.end_date,
      prize: request.prize,
      is_active: true,
      created_at: new Date().toISOString(),
      created_by: 'You',
      join_code: (request.name.slice(0,3) + Math.floor(1000+Math.random()*9000)).toUpperCase(),
      is_private: false,
    };
    leagues.push(newLeague);
    this.saveDb(leagues);
    return newLeague;
  }

  async joinLeague(request: JoinLeagueRequest): Promise<{ message: string; league: League }> {
    const leagues = this.getDb();
    const league = leagues.find(l => (l.join_code || '').toUpperCase() === request.league_code.toUpperCase());
    if (!league) throw new Error('League not found with that code');
    if (league.member_count >= league.max_members) throw new Error('League is full');
    if (!league.is_active) throw new Error('League is not active');
    league.member_count += 1;
    this.saveDb(leagues);
    return { message: 'Successfully joined league!', league };
  }
}

export const leagueService = new LeagueService();