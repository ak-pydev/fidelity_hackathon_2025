'use client';

import React, { useState } from 'react';
import { Layout } from '../../../components/Layout';
import { Card, CardContent } from '../../../components/Card';
import { Button } from '../../../components/Button';
import Link from 'next/link';
import { ArrowLeft, Search, Users, Calendar, Trophy } from 'lucide-react';

// Mock available leagues
const availableLeagues = [
  {
    id: '4',
    name: 'Weekend Warriors',
    description: 'Casual trading for weekend enthusiasts',
    memberCount: 5,
    maxMembers: 15,
    startDate: '2025-02-15',
    endDate: '2025-04-15',
    prize: '$300',
    isPrivate: false,
  },
  {
    id: '5',
    name: 'High Volatility Heroes',
    description: 'For traders who love volatile markets',
    memberCount: 8,
    maxMembers: 12,
    startDate: '2025-02-01',
    endDate: '2025-03-31',
    prize: '$750',
    isPrivate: false,
  },
  {
    id: '6',
    name: 'Conservative Crew',
    description: 'Low-risk strategies focus',
    memberCount: 12,
    maxMembers: 20,
    startDate: '2025-02-10',
    endDate: '2025-04-10',
    prize: 'Trophy + Certificate',
    isPrivate: false,
  },
];

export default function JoinLeaguePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const filteredLeagues = availableLeagues.filter(league =>
    league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    league.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinLeague = (leagueId: string) => {
    console.log('Joining league:', leagueId);
    // Handle join league logic
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Joining by invite code:', inviteCode);
    // Handle join by invite code logic
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link 
              href="/leagues" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leagues
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Join a League</h1>
            <p className="mt-2 text-gray-600">
              Find and join existing leagues or use an invite code
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Join by Invite Code */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Join by Invite Code
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Have an invite code? Enter it below to join a private league.
                  </p>
                  <form onSubmit={handleJoinByCode} className="space-y-4">
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter invite code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button type="submit" className="w-full">
                      Join League
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Browse Public Leagues */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Public Leagues
                    </h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search leagues..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredLeagues.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No leagues found matching your search.
                      </div>
                    ) : (
                      filteredLeagues.map((league) => (
                        <div
                          key={league.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {league.name}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {league.description}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleJoinLeague(league.id)}
                              disabled={league.memberCount >= league.maxMembers}
                            >
                              {league.memberCount >= league.maxMembers ? 'Full' : 'Join'}
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {league.memberCount}/{league.maxMembers} members
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(league.startDate).toLocaleDateString()} - {new Date(league.endDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 mr-1" />
                              {league.prize}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
