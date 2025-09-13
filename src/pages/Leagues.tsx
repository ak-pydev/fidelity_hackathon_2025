import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trophy, Calendar, Plus } from 'lucide-react';
import { leagueService, League } from '../utils/league-service';

export default function Leagues() {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        const data = await leagueService.getLeagues();
        setLeagues(data);
      } catch (err) {
        setError('Failed to load leagues. Please try again.');
        console.error('Error fetching leagues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);
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
              <Button 
                onClick={() => navigate('/leagues/create')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create League
              </Button>
              <Button 
                variant="secondary"
                onClick={() => navigate('/leagues/join')}
              >
                Join League
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Loading leagues...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues.map((league) => (
                <Card key={league.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {league.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          league.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {league.is_active ? 'Active' : 'Full'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{league.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-2" />
                        {league.member_count}/{league.max_members} members
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(league.start_date).toLocaleDateString()} - {new Date(league.end_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Trophy className="h-4 w-4 mr-2" />
                        Prize: {league.prize}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/leagues/${league.id}`)}
                      >
                        View Details
                      </Button>
                      {league.is_active && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => navigate('/leagues/join')}
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}