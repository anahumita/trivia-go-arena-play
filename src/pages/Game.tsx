
import React, { useEffect, useState } from 'react';
import GameSetup from '@/components/GameSetup';
import GameBoard from '@/components/GameBoard';
import PlayerInfo from '@/components/PlayerInfo';
import QuestionCard from '@/components/QuestionCard';
import GameControls from '@/components/GameControls';
import GameOver from '@/components/GameOver';
import ExitButton from '@/components/ExitButton';
import { useGameState } from '@/hooks/useGameState';
import { GameMode } from '@/types/game';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { configureApiUrl } from '@/hooks/game/apiUtils';
import { AlertCircle } from 'lucide-react';

const Game: React.FC = () => {
  const {
    players,
    currentPlayerIndex,
    currentQuestion,
    gameMode,
    gameStatus,
    round,
    showQuestion,
    answerSelected,
    initializeGame,
    startTurn,
    handleAnswer,
    resetGame,
    autoAnswer,
    MAX_ROUNDS
  } = useGameState();
  
  const [timeRemaining, setTimeRemaining] = useState<number>(10);
  const [showApiConfig, setShowApiConfig] = useState<boolean>(false);
  const [apiUrl, setApiUrl] = useState<string>("https://unveweezricvhihoudna.supabase.co/rest/v1");
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'pending' | 'connected' | 'error'>('pending');

  const currentPlayer = players[currentPlayerIndex] || { id: 0, name: '', position: 0, score: 0, skipNextTurn: false };

  // Handle API URL configuration
  const handleApiConfig = () => {
    if (apiUrl.trim()) {
      configureApiUrl(apiUrl.trim());
      setShowApiConfig(false);
      toast({
        title: "API Configured",
        description: "The API URL has been set successfully.",
      });
      
      // Update connection status
      setApiConnectionStatus('connected');
      
      // Show success notification
      toast({
        title: "API Connection Successful",
        description: "The application is now connected to the questions API.",
      });
    }
  };
  
  // Check API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch(`${apiUrl}/questions?limit=1`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVudmV3ZWV6cmljdmhpaG91ZG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NDY0OTAsImV4cCI6MjA2MTMyMjQ5MH0.sqxKlYhJGPfx67v7Vflc2UijACuHvtz2u2KLL-IljMo",
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVudmV3ZWV6cmljdmhpaG91ZG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NDY0OTAsImV4cCI6MjA2MTMyMjQ5MH0.sqxKlYhJGPfx67v7Vflc2UijACuHvtz2u2KLL-IljMo`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Connection Test Result:', data);
          setApiConnectionStatus('connected');
          toast({
            title: "API Connection Verified",
            description: "Successfully connected to the Supabase questions API.",
          });
        } else {
          console.error('API Connection Test Failed:', response.status);
          setApiConnectionStatus('error');
          toast({
            title: "API Connection Failed",
            description: "Could not connect to the API. Check console for details.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('API Connection Error:', error);
        setApiConnectionStatus('error');
        toast({
          title: "API Connection Error",
          description: "Failed to connect to the API. Check network and try again.",
          variant: "destructive"
        });
      }
    };
    
    checkApiConnection();
  }, [apiUrl]);

  // Question timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (showQuestion && !answerSelected) {
      setTimeRemaining(10);
      
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            // Time's up - auto-select wrong answer
            toast({
              title: "Time's up!",
              description: `${currentPlayer.name} ran out of time!`,
              variant: "destructive"
            });
            autoAnswer();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showQuestion, answerSelected, currentPlayer.name, autoAnswer]);

  // Automatically start turn after a short delay when we have a new current player
  useEffect(() => {
    if (gameStatus === 'playing' && players.length > 0 && !showQuestion) {
      const timer = setTimeout(() => {
        startTurn();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIndex, gameStatus, players, showQuestion, startTurn]);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-4xl font-bold text-center text-primary mb-6">TriviaGo</h1>
      <ExitButton />
      
      {/* API Connection Status Indicator */}
      <div className={`mb-4 text-center p-2 rounded-md ${
        apiConnectionStatus === 'connected' ? 'bg-green-100 text-green-700' : 
        apiConnectionStatus === 'error' ? 'bg-red-100 text-red-700' :
        'bg-yellow-100 text-yellow-700'
      }`}>
        <div className="flex items-center justify-center gap-2">
          <span className={`inline-block h-3 w-3 rounded-full ${
            apiConnectionStatus === 'connected' ? 'bg-green-500' :
            apiConnectionStatus === 'error' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}></span>
          <span>
            {apiConnectionStatus === 'connected' ? 'API Connected' :
             apiConnectionStatus === 'error' ? 'API Connection Failed' :
             'Checking API Connection...'}
          </span>
        </div>
      </div>
      
      {gameStatus === 'setup' && (
        <>
          <div className="mb-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowApiConfig(!showApiConfig)}
            >
              {showApiConfig ? 'Hide API Config' : 'Configure API'}
            </Button>
          </div>
          
          {showApiConfig && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Configure API Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="api-url">API URL</Label>
                  <Input 
                    id="api-url"
                    placeholder="Enter Supabase API URL"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                  />
                  <Button onClick={handleApiConfig}>Save API Configuration</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Default API: https://unveweezricvhihoudna.supabase.co/rest/v1
                  </p>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mt-2 flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-800 text-sm">API Status: {apiConnectionStatus === 'connected' ? 'Connected' : apiConnectionStatus === 'error' ? 'Connection Failed' : 'Connecting...'}</p>
                      <p className="text-xs text-amber-700 mt-1">
                        {apiConnectionStatus === 'connected' 
                          ? 'The game is successfully connected to the questions API.'
                          : 'Make sure the API URL is correct and the server is accessible.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <GameSetup onStartGame={(mode: GameMode, playerNames: string[]) => initializeGame(mode, playerNames)} />
        </>
      )}
      
      {gameStatus === 'playing' && (
        <div className="space-y-6">
          <PlayerInfo 
            players={players} 
            currentPlayerIndex={currentPlayerIndex} 
            round={round} 
            maxRounds={MAX_ROUNDS} 
          />
          
          <GameBoard players={players} />
          
          {showQuestion && currentQuestion && (
            <QuestionCard 
              question={currentQuestion} 
              onAnswer={handleAnswer} 
              answerSelected={answerSelected} 
            />
          )}
          
          <GameControls 
            currentPlayer={currentPlayer} 
            onRoll={startTurn} 
            showQuestion={showQuestion}
            timeRemaining={showQuestion ? timeRemaining : undefined}
          />
        </div>
      )}
      
      {gameStatus === 'gameOver' && (
        <GameOver players={players} onRestart={resetGame} />
      )}
    </div>
  );
};

export default Game;
