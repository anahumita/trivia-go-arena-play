
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dice, HelpCircle } from 'lucide-react';
import { Player } from '@/types/game';

interface GameControlsProps {
  currentPlayer: Player;
  onRoll: () => void;
  showQuestion: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  currentPlayer, 
  onRoll, 
  showQuestion 
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
              <Dice className="mr-2 h-5 w-5" />
              Roll for Question
            </Button>
            
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              <HelpCircle className="inline h-4 w-4 mr-1" />
              Answer correctly to move forward on the board and gain points!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameControls;
