
import React from 'react';
import { Player } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PlayerInfoProps {
  players: Player[];
  currentPlayerIndex: number;
  round: number;
  maxRounds: number;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ players, currentPlayerIndex, round, maxRounds }) => {
  return (
    <div className="w-full mb-6 animate-fade-in">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-xl font-bold">Game Progress</h2>
        <Badge variant="outline" className="text-sm">
          Round {round} of {maxRounds}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((player, index) => (
          <Card 
            key={player.id} 
            className={cn(
              "border-2 transition-all duration-300",
              index === currentPlayerIndex ? "border-primary shadow-md" : ""
            )}
          >
            <CardHeader className="py-3">
              <CardTitle className="flex justify-between items-center">
                <span className={cn(
                  "flex items-center gap-2",
                  index === currentPlayerIndex ? "text-primary" : ""
                )}>
                  <span 
                    className={cn(
                      "inline-block w-3 h-3 rounded-full",
                      `player-${player.id}`
                    )}
                  ></span>
                  {player.name}
                </span>
                {index === currentPlayerIndex && (
                  <Badge 
                    variant="default" 
                    className="animate-pulse bg-primary text-white"
                  >
                    Current Turn
                  </Badge>
                )}
                {player.skipNextTurn && (
                  <Badge 
                    variant="destructive"
                  >
                    Skip Next Turn
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="flex justify-between text-sm">
                <div>Position: <span className="font-bold">{player.position}</span></div>
                <div>Score: <span className="font-bold">{player.score}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlayerInfo;
