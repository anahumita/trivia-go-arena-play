
import React from 'react';
import { Player } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface GameOverProps {
  players: Player[];
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ players, onRestart }) => {
  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default GameOver;
