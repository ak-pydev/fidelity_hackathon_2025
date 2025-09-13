'use client';

import React from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { Users, Trophy, Calendar, Plus } from 'lucide-react';
import { mockLeagues } from '../../lib/mockData';

export default function LeaguesPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fantasy Leagues</h1>
              <p className="mt-2 text-gray-600">
                Join or create leagues to compete with friends in options trading
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/leagues/create">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create League
                </Button>
              </Link>
              <Link href="/leagues/join">
                <Button variant="secondary">Join League</Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockLeagues.map((league) => (
              <Card key={league.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {league.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        league.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {league.isActive ? 'Active' : 'Full'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{league.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      {league.memberCount}/{league.maxMembers} members
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(league.startDate).toLocaleDateString()} - {new Date(league.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Trophy className="h-4 w-4 mr-2" />
                      Prize: {league.prize}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/leagues/${league.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    {league.isActive && (
                      <Button size="sm" variant="secondary">
                        Join
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
