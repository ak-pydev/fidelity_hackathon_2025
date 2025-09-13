import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { leagueService } from '../utils/league-service';

export default function JoinLeague() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const leagueCode = formData.get('leagueCode') as string;

    try {
      const result = await leagueService.joinLeague({ league_code: leagueCode });
      setSuccess(result.message);
      // Navigate to the specific league detail page
      setTimeout(() => navigate(`/leagues/${result.league.id}`), 1500);
    } catch (err) {
      setError('Failed to join league. Please check the code and try again.');
      console.error('Error joining league:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <CardTitle className="text-2xl">Join League</CardTitle>
              <p className="text-gray-600">Enter a league code to join</p>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="leagueCode">League Code</Label>
                  <Input 
                    id="leagueCode"
                    name="leagueCode"
                    placeholder="Enter league code (e.g, OTM2025)"
                    className="text-center text-lg tracking-widest uppercase"
                    required 
                  />
                  <p className="text-xs text-gray-500 text-center">
                    For demo: try "OTM2025", "BFL2025", "TECH25", "WKND25", or "VOLHERO"
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Joining...' : 'Join League'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/leagues')} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}