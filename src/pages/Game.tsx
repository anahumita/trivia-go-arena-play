
import React, { useEffect } from 'react';
import GameSetup from '@/components/GameSetup';
import GameBoard from '@/components/GameBoard';
import PlayerInfo from '@/components/PlayerInfo';
import QuestionCard from '@/components/QuestionCard';
import GameControls from '@/components/GameControls';
import GameOver from '@/components/GameOver';
import { useGameState } from '@/hooks/useGameState';
import { GameMode } from '@/types/game';

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
    MAX_ROUNDS
  } = useGameState();

  const currentPlayer = players[currentPlayerIndex] || { id: 0, name: '', position: 0, score: 0, skipNextTurn: false };

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
      
      {gameStatus === 'setup' && (
        <GameSetup onStartGame={(mode: GameMode, playerNames: string[]) => initializeGame(mode, playerNames)} />
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
