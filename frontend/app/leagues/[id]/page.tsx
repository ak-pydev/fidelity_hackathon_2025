'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '../../../components/Layout';
import { Card, CardContent } from '../../../components/Card';
import { Button } from '../../../components/Button';
import Link from 'next/link';
import { ArrowLeft, Users, Calendar, Trophy, TrendingUp, Copy, Share } from 'lucide-react';
import { getLeagueById, getLeaderboardByLeagueId } from '../../../lib/mockData';

export default function LeagueDetailPage() {
  const params = useParams();
  const leagueId = params?.id as string;
  
  // Get league data from mock data
  const league = getLeagueById(leagueId);
  const leaderboard = getLeaderboardByLeagueId(leagueId);

  // Default rules for all leagues
  const defaultRules = [
    'Starting portfolio value: $100,000 (virtual money)',
    'All options strategies allowed',
    'No day trading restrictions',
    'Real-time market data and pricing',
    'Weekly performance reviews and rankings',
    'Educational resources and strategy guides available'
  ];

  if (!league) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">League Not Found</h1>
            <p className="text-gray-600 mb-6">The league you're looking for doesn't exist.</p>
            <Link href="/leagues">
              <Button>Back to Leagues</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleCopyJoinCode = () => {
    navigator.clipboard.writeText(league.joinCode || '');
    // In a real app, you'd show a toast notification here
    alert('Join code copied to clipboard!');
  };
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link 
              href="/leagues" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leagues
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{league.name}</h1>
                <p className="mt-2 text-gray-600 max-w-2xl">
                  {league.description}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleCopyJoinCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Join Code
                </Button>
                <Button>Join League</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* League Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">League Details</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        Members
                      </div>
                      <span className="font-medium">{league.memberCount}/{league.maxMembers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Duration
                      </div>
                      <span className="font-medium text-sm">
                        {new Date(league.startDate).toLocaleDateString()} - {new Date(league.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Trophy className="h-4 w-4 mr-2" />
                        Prize
                      </div>
                      <span className="font-medium">{league.prize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Created by</span>
                      <span className="font-medium">{league.createdBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        league.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {league.isActive ? 'Active' : 'Ended'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Join Code</span>
                      <span className="font-medium font-mono text-blue-600">{league.joinCode}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">League Rules</h2>
                  <ul className="space-y-2">
                    {defaultRules.map((rule: string, index: number) => (
                      <li key={index} className="text-gray-600 text-sm flex items-start">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
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
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Leaderboard</h2>
                    <div className="flex items-center text-sm text-gray-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Updated in real-time
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Rank</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Player</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Portfolio Value</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">P&L</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Return %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500">
                              No players yet. Be the first to join!
                            </td>
                          </tr>
                        ) : (
                          leaderboard.map((player: any) => (
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
                              <td className="py-4 px-4 text-right font-medium">
                                ${player.portfolioValue.toLocaleString()}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <span className={`font-medium ${
                                  player.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {player.pnl >= 0 ? '+' : ''}${player.pnl.toLocaleString()}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <span className={`font-medium ${
                                  player.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {player.pnlPercent >= 0 ? '+' : ''}{player.pnlPercent}%
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
