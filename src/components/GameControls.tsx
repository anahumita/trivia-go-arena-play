
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dice1, HelpCircle, Home, Timer } from 'lucide-react';
import { Player } from '@/types/game';
import { Link } from 'react-router-dom';

interface GameControlsProps {
  currentPlayer: Player;
  onRoll: () => void;
  showQuestion: boolean;
  timeRemaining?: number;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  currentPlayer, 
  onRoll, 
  showQuestion,
  timeRemaining
}) => {
  return (
    <div className="w-full flex justify-center mt-4 mb-6 animate-fade-in">
      <div className="max-w-lg w-full">
        {!showQuestion && (
          <div className="text-center space-y-4">
            <p className="text-lg">
              {currentPlayer.skipNextTurn ? (
                <span className="text-destructive font-semibold">
                  {currentPlayer.name}'s turn is skipped!
                </span>
              ) : (
                <span>
                  It's <span className="font-semibold">{currentPlayer.name}'s</span> turn!
                </span>
              )}
            </p>
            <Button 
              onClick={onRoll}
              className="px-8 py-6 text-lg"
              disabled={currentPlayer.skipNextTurn}
            >
              <Dice1 className="mr-2 h-5 w-5" />
              Roll for Question
            </Button>
            
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              <HelpCircle className="inline h-4 w-4 mr-1" />
              Answer correctly to move forward on the board and gain points!
            </p>

            <div className="mt-8 flex justify-center">
              <Button variant="outline" asChild>
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  Exit to Homepage
                </Link>
              </Button>
            </div>
          </div>
        )}

        {showQuestion && timeRemaining !== undefined && (
          <div className="flex justify-center items-center text-lg font-semibold mt-2">
            <Timer className="mr-2 h-5 w-5 text-primary" />
            Time remaining: {timeRemaining} seconds
          </div>
        )}
      </div>
    </div>
  );
};

export default GameControls;
