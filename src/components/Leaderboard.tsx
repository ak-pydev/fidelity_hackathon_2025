import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { leaderboardService } from "@/utils/leaderboard-service";
import { userService } from "@/utils/user-service";

type LeaderboardEntry = {
  rank: number;
  username: string;
  portfolioValue: number;
  pnl: number;
  pnlPercent: number;
  userId?: string;
};

interface LeaderboardProps {
  leagueId?: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
  }
};

export default function Leaderboard({ leagueId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cu = userService.getCurrentUser();
      setCurrentUserId(cu?.id || null);
      let id = leagueId;
      if (!id) {
        const saved = localStorage.getItem('currentLeague');
        if (saved) {
          const parsed = JSON.parse(saved);
          id = parsed?.id;
        }
      }
      const lb = id ? leaderboardService.getLeaderboard(id) : [];
      setEntries([...(lb as LeaderboardEntry[])]);
    } catch {
      setEntries([]);
    }
  }, [leagueId]);

  return (
    <div className="space-y-4">
      {entries.map((player, i) => (
        <Card
          key={i}
          className={`hover:shadow-md transition-shadow ${player.rank <= 3 ? 'ring-2 ring-primary/20' : ''} ${player.userId && currentUserId === player.userId ? 'border-2 border-primary' : ''}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getRankIcon(player.rank)}
                <div>
                  <h3 className="font-medium text-gray-900">{player.username} {player.userId && currentUserId === player.userId ? <span className="ml-2 text-xs text-primary">(You)</span> : null}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">Portfolio:</span>
                    <span className="font-mono font-semibold">${player.portfolioValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={player.pnlPercent >= 0 ? "default" : "destructive"} className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {player.pnlPercent > 0 ? '+' : ''}{player.pnlPercent}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}