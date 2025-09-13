import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, Calendar, ArrowLeft } from 'lucide-react';
import { leagueService, League } from '../utils/league-service';
import { toast } from 'sonner';

export default function LeagueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const handleJoinLeague = async () => {
    if (!league?.join_code) return;
    
    setJoining(true);
    try {
      const result = await leagueService.joinLeague({ league_code: league.join_code });
      toast.success(result.message);
      // Update the league data to reflect the new member count
      setLeague(prev => prev ? { ...prev, member_count: prev.member_count + 1 } : null);
      // Persist joined league so Dashboard can render the correct league
      try {
        localStorage.setItem('currentLeague', JSON.stringify(result.league));
      } catch (e) {
        console.warn('Failed to persist currentLeague to localStorage', e);
      }
      // Navigate to trading competition dashboard after successful join
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      toast.error('Failed to join league. You may already be a member or the league is full.');
      console.error('Error joining league:', err);
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    const fetchLeague = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await leagueService.getLeague(id);
        setLeague(data);
      } catch (err) {
        setError('Failed to load league details.');
        console.error('Error fetching league:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeague();
  }, [id]);
  
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-center">Loading league details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !league) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold">{error || "League not found"}</h1>
            <Button onClick={() => navigate('/leagues')} className="mt-4">
              Back to Leagues
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/leagues')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leagues
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{league.name}</CardTitle>
                  <p className="text-gray-600 mt-2">{league.description}</p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    league.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {league.is_active ? 'Active' : 'Full'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">{league.member_count}/{league.max_members}</p>
                    <p className="text-sm">Members</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">
                      {new Date(league.start_date).toLocaleDateString()} - {new Date(league.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm">Duration</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Trophy className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">{league.prize}</p>
                    <p className="text-sm">Prize</p>
                  </div>
                </div>
              </div>

              {league.is_active && (
                <div className="flex gap-4">
                  <Button 
                    className="flex-1" 
                    onClick={handleJoinLeague}
                    disabled={joining || league.member_count >= league.max_members}
                  >
                    {joining ? 'Joining...' : 
                     league.member_count >= league.max_members ? 'League Full' : 'Join League'}
                  </Button>
                  <Button variant="outline">Invite Friends</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}