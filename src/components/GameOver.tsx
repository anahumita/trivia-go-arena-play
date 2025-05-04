
import React from 'react';
import { Player } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Home, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GameOverProps {
  players: Player[];
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ players, onRestart }) => {
  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const { user } = useAuth();
  
  React.useEffect(() => {
    // Update leaderboard when game is completed
    const updateLeaderboard = async () => {
      if (!user) return;
      
      try {
        // Find the winner and their score
        const winner = sortedPlayers[0];
        
        // Get current leaderboard entry for the user
        const { data: currentEntry, error: fetchError } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching leaderboard entry:', fetchError);
          return;
        }

        // Calculate current rank by getting all scores higher than this one
        const { count: betterScores, error: rankError } = await supabase
          .from('leaderboard')
          .select('*', { count: 'exact', head: true })
          .gt('score', winner.score);

        if (rankError) {
          console.error('Error calculating rank:', rankError);
        }

        const newRank = (betterScores ?? 0) + 1; // Rank is 1-based (1 is the best)
        
        if (currentEntry) {
          // Update existing entry
          const { error: updateError } = await supabase
            .from('leaderboard')
            .update({
              score: Math.max(currentEntry.score, winner.score),
              games_won: currentEntry.games_won + (winner.name === user.user_metadata.username ? 1 : 0),
              rank: newRank
            })
            .eq('user_id', user.id);
            
          if (updateError) {
            console.error('Error updating leaderboard:', updateError);
          } else {
            toast.success('Leaderboard updated!');
          }
        } else {
          // Create new entry
          const { error: insertError } = await supabase
            .from('leaderboard')
            .insert([
              {
                user_id: user.id,
                score: winner.score,
                games_won: winner.name === user.user_metadata.username ? 1 : 0,
                rank: newRank
              }
            ]);
            
          if (insertError) {
            console.error('Error creating leaderboard entry:', insertError);
          } else {
            toast.success('Created new leaderboard entry!');
          }
        }
      } catch (error) {
        console.error('Exception updating leaderboard:', error);
      }
    };
    
    updateLeaderboard();
  }, [sortedPlayers, user]);
  
  return (
    <div className="flex justify-center items-center min-h-[80vh] animate-slide-up">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Trophy className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Game Over!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold">
              {sortedPlayers[0].name} Wins!
            </h3>
            <p className="text-muted-foreground">
              Final Score: {sortedPlayers[0].score} points
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Final Results</h4>
            {sortedPlayers.map((player, index) => (
              <div 
                key={player.id}
                className={cn(
                  "flex items-center p-3 rounded-md border",
                  index === 0 ? "bg-amber-50 border-amber-200" : "bg-muted/50"
                )}
              >
                <div className="mr-3">
                  {index === 0 ? (
                    <Medal className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Position: {player.position} • Score: {player.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button onClick={onRestart} className="w-full">
            Play Again
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Return Home
            </Link>
          </Button>
          {user && (
            <Button asChild variant="ghost" className="w-full">
              <Link to="/dashboard">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                View Dashboard
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameOver;
