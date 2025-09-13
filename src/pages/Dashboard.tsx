'use client';

import React, { useEffect, useMemo, useState } from "react";

import { Layout } from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, Trophy, TrendingUp, Copy, Share } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TradeForm from "@/components/TradeForm";
import PortfolioTable from "@/components/PortfolioTable";
import TradingPayoffChart from "@/components/TradingPayoffChart";
import { mockPortfolio } from "@/lib/mockData";
import type { Trade } from "@/types";
import { League } from "@/utils/league-service";
import { getLeaderboardByLeagueId } from "@/lib/mockData";

// Current league is sourced from localStorage when user joins from LeagueDetails

// League-specific leaderboard will be derived from mock data using the selected league ID

// Default rules for all leagues
const defaultRules = [
  'Starting portfolio value: $100,000 (virtual money)',
  'All options strategies allowed',
  'No day trading restrictions',
  'Real-time market data and pricing',
  'Weekly performance reviews and rankings',
  'Educational resources and strategy guides available'
];

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<Trade[]>(mockPortfolio);
  const navigate = useNavigate();
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [leaderboard, setLeaderboard] = useState<Array<{ rank: number; username: string; portfolioValue: number; pnl: number; pnlPercent: number }>>([]);

  // Build portfolio from paper trading storage (Analysis page)
  const loadPaperPortfolio = (): Trade[] => {
    try {
      const rawPos = localStorage.getItem('paperPositions');
      const rawMeta = localStorage.getItem('paperPositionMeta');
      const positions = rawPos ? JSON.parse(rawPos) as Record<string, { quantity: number; avgCost: number; realizedPnL: number }> : {};
      const meta = rawMeta ? JSON.parse(rawMeta) as Record<string, { underlying: string; option_type: 'call' | 'put'; strike: number; premium: number; expiration: string }> : {};
      const trades: Trade[] = [];
      for (const key of Object.keys(positions)) {
        const p = positions[key];
        if (!p || p.quantity <= 0) continue;
        const m = meta[key];
        if (!m) continue;
        // premium for Trade is per-share; avgCost we track is per-contract. Convert to per-share.
        const premiumPerShare = Math.max(0, (p.avgCost || (m.premium * 100)) / 100);
        trades.push({
          stock: m.underlying,
          type: m.option_type,
          strike: m.strike,
          premium: Math.round(premiumPerShare * 100) / 100,
          quantity: p.quantity,
        });
      }
      return trades;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('currentLeague');
      if (saved) {
        const parsed: League = JSON.parse(saved);
        setCurrentLeague(parsed);
        // Initialize leaderboard for this league
        const lb = getLeaderboardByLeagueId(parsed.id);
        setLeaderboard([...lb]);
      }
      // Load paper trades into dashboard portfolio
      setPortfolio(loadPaperPortfolio());
    } catch (e) {
      console.warn('Failed to read currentLeague from localStorage', e);
    }
  }, []);

  // Listen for updates from Analysis page and refresh positions
  useEffect(() => {
    const handler = () => setPortfolio(loadPaperPortfolio());
    window.addEventListener('paper-portfolio-updated', handler as EventListener);
    return () => window.removeEventListener('paper-portfolio-updated', handler as EventListener);
  }, []);

  const handleCopyJoinCode = () => {
    navigator.clipboard.writeText(currentLeague.join_code);
    // Show a toast notification
    alert('Join code copied to clipboard!');
  };

  // If no league is selected, prompt user to choose a league
  if (!currentLeague) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/leagues')}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leagues
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>Select a League</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">No active league selected. Join or open a league from the leagues page to view the dashboard.</p>
                <div className="mt-4">
                  <Button onClick={() => navigate('/leagues')}>Go to Leagues</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* League Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/leagues')}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leagues
            </Button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentLeague.name}</h1>
                <p className="mt-2 text-gray-600 max-w-2xl">
                  {currentLeague.description}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCopyJoinCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Join Code
                </Button>
                <Button>
                  <Share className="h-4 w-4 mr-2" />
                  Share League
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* League Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>League Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        Members
                      </div>
                      <span className="font-medium">{currentLeague.member_count}/{currentLeague.max_members}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Duration
                      </div>
                      <span className="font-medium text-sm">
                        {new Date(currentLeague.start_date).toLocaleDateString()} - {new Date(currentLeague.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Trophy className="h-4 w-4 mr-2" />
                        Prize
                      </div>
                      <span className="font-medium">{currentLeague.prize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Created by</span>
                      <span className="font-medium">{currentLeague.created_by}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge variant={currentLeague.is_active ? "default" : "secondary"}>
                        {currentLeague.is_active ? 'Active' : 'Ended'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Join Code</span>
                      <span className="font-medium font-mono text-blue-600">{currentLeague.join_code}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>League Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {defaultRules.map((rule, index) => (
                      <li key={index} className="text-gray-600 text-sm flex items-start">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Leaderboard</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Updated in real-time
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Rank</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Player</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Portfolio Value</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">P&L</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Return %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((player) => (
                          <tr key={player.rank} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                  player.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                  player.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                  player.rank === 3 ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {player.rank}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{player.username}</div>
                            </td>
                            <td className="py-4 px-4 text-right font-medium font-mono">
                              ${player.portfolioValue.toLocaleString()}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={`font-medium font-mono ${
                                player.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {player.pnl >= 0 ? '+' : ''}${player.pnl.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={`font-medium font-mono ${
                                player.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {player.pnlPercent >= 0 ? '+' : ''}{player.pnlPercent}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Trading Section */}
          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Trading Dashboard</h2>
              
              {/* Trade Form Section */}
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Trade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TradeForm portfolio={portfolio} setPortfolio={setPortfolio} />
                  </CardContent>
                </Card>
              </div>

              {/* Portfolio Overview */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Current Positions</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setPortfolio(loadPaperPortfolio())}>Refresh Positions</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-500 mb-2">Source: Paper Trading (Analysis)</div>
                    <PortfolioTable portfolio={portfolio} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TradingPayoffChart portfolio={portfolio} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}