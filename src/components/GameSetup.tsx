
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GameMode } from '@/types/game';

interface GameSetupProps {
  onStartGame: (mode: GameMode, playerNames: string[]) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const playerNames = gameMode === 'single' 
      ? [player1Name] 
      : [player1Name, player2Name];
    
    onStartGame(gameMode, playerNames);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] animate-fade-in">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-primary">TriviaGo</CardTitle>
          <CardDescription className="text-center">
            Test your knowledge and race to the finish!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="game-mode">Game Mode</Label>
              <RadioGroup 
                id="game-mode" 
                defaultValue="single" 
                className="flex space-x-4"
                onValueChange={(value) => setGameMode(value as GameMode)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="cursor-pointer">Single Player</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multiplayer" id="multiplayer" />
                  <Label htmlFor="multiplayer" className="cursor-pointer">Two Players</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="player1-name">Player 1 Name</Label>
              <Input
                id="player1-name"
                placeholder="Enter name"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="w-full"
                required
              />
            </div>

            {gameMode === 'multiplayer' && (
              <div className="space-y-2">
                <Label htmlFor="player2-name">Player 2 Name</Label>
                <Input
                  id="player2-name"
                  placeholder="Enter name"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Start Game
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default GameSetup;
