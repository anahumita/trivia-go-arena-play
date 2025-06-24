import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LeaderboardEntry {
  id: number; // Changed from string to number to match Supabase
  user_id: string;
  score: number;
  games_won: number;
  rank: number;
  strongest_category: string;
  users?: {
    username: string;
    email: string;
  };
}

const AdminLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(`
          *,
          users:user_id (
            username,
            email
          )
        `)
        .order('score', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading leaderboard:', error);
        toast.error('Failed to load leaderboard');
        return;
      }

      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const resetLeaderboard = async () => {
    if (!confirm('Are you sure you want to reset the entire leaderboard? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('leaderboard')
        .update({ 
          score: 0, 
          games_won: 0, 
          rank: 0 
        })
        .neq('id', 0); // Changed to use number comparison

      if (error) {
        console.error('Error resetting leaderboard:', error);
        toast.error('Failed to reset leaderboard');
        return;
      }

      toast.success('Leaderboard reset successfully');
      loadLeaderboard();
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
      toast.error('Failed to reset leaderboard');
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium">#{position}</span>;
    }
  };

  const getRankBadge = (position: number) => {
    if (position <= 3) {
      return (
        <Badge 
          variant={position === 1 ? "default" : position === 2 ? "secondary" : "outline"}
          className="flex items-center gap-1"
        >
          {getRankIcon(position)}
          {position === 1 ? "Champion" : position === 2 ? "Runner-up" : "Third Place"}
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Leaderboard Management</CardTitle>
          <Button 
            variant="destructive" 
            onClick={resetLeaderboard}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Leaderboard
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Games Won</TableHead>
              <TableHead>Strongest Category</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry, index) => {
              const position = index + 1;
              return (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(position)}
                      {getRankBadge(position)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {entry.users?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.users?.email || 'No email'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-lg">{entry.score.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>{entry.games_won}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.strongest_category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={entry.score > 0 ? "default" : "secondary"}
                    >
                      {entry.score > 0 ? "Active" : "No Games"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {leaderboard.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No leaderboard entries found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLeaderboard;
