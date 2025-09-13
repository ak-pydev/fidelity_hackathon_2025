import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { leagueService } from '../utils/league-service';

export default function CreateLeague() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    try {
      await leagueService.createLeague({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        start_date: formData.get('startDate') as string,
        end_date: formData.get('endDate') as string,
        max_members: parseInt(formData.get('maxMembers') as string),
        prize: formData.get('prize') as string,
      });
      
      navigate('/leagues');
    } catch (err) {
      setError('Failed to create league. Please try again.');
      console.error('Error creating league:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <CardTitle className="text-2xl">Create New League</CardTitle>
              <p className="text-gray-600">Set up your fantasy options trading league</p>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">League Name</Label>
                  <Input id="name" name="name" placeholder="Enter league name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Describe your league" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" name="endDate" type="date" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Members</Label>
                  <Input id="maxMembers" name="maxMembers" type="number" min="2" max="50" defaultValue="10" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prize">Prize</Label>
                  <Input id="prize" name="prize" placeholder="e.g., $500 Cash Prize or Learning Materials" />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Creating...' : 'Create League'}
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