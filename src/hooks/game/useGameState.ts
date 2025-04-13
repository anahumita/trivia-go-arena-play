
import { useState, useCallback, useRef } from 'react';
import { Player, Question, GameMode, GameStatus } from '@/types/game';
import { toast } from '@/components/ui/use-toast';
import { MAX_ROUNDS, MAX_POSITION, getRandomQuestion, processSquareEffect } from './gameUtils';
import { GameState } from './types';

export const useGameState = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("single");
  const [gameStatus, setGameStatus] = useState<GameStatus>("setup");
  const [round, setRound] = useState(1);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answerSelected, setAnswerSelected] = useState(false);
  
  // Track used question IDs to prevent repetition
  const usedQuestionIds = useRef<Set<number>>(new Set());

  const initializeGame = useCallback((mode: GameMode, playerNames: string[]) => {
    const newPlayers: Player[] = playerNames.map((name, index) => ({
      id: index + 1,
      name,
      position: 0,
      score: 0,
      skipNextTurn: false
    }));
    
    setPlayers(newPlayers);
    setGameMode(mode);
    setGameStatus("playing");
    setCurrentPlayerIndex(0);
    setRound(1);
    usedQuestionIds.current.clear(); // Reset used questions when starting a new game
    
    toast({
      title: "Game Started!",
      description: `${playerNames.join(" and ")} are ready to play!`
    });
  }, []);

  const startTurn = useCallback(() => {
    const player = players[currentPlayerIndex];
    
    if (player.skipNextTurn) {
      toast({
        title: "Turn Skipped",
        description: `${player.name}'s turn is skipped this round.`,
        variant: "destructive"
      });
      
      // Reset skip flag and move to next player
      setPlayers(prev => 
        prev.map(p => 
          p.id === player.id ? { ...p, skipNextTurn: false } : p
        )
      );
      
      moveToNextPlayer();
      return;
    }
    
    const question = getRandomQuestion(usedQuestionIds.current);
    setCurrentQuestion(question);
    setShowQuestion(true);
    setAnswerSelected(false);
  }, [currentPlayerIndex, players]);

  const moveToNextPlayer = useCallback(() => {
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    
    // If we're back to the first player, increment the round
    if (nextPlayerIndex === 0) {
      const newRound = round + 1;
      setRound(newRound);
      
      // Check if we've reached the maximum number of rounds
      if (newRound > MAX_ROUNDS) {
        endGame();
        return;
      }
    }
  }, [currentPlayerIndex, players.length, round]);

  const endGame = useCallback((winnerId?: number) => {
    if (winnerId) {
      toast({
        title: "Game Over!",
        description: `${players.find(p => p.id === winnerId)?.name} reached the end and wins!`
      });
    } else {
      // Find player with highest score
      const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
      const winner = sortedPlayers[0];
      
      toast({
        title: "Game Over!",
        description: `${winner.name} wins with ${winner.score} points!`
      });
    }
    
    setGameStatus("gameOver");
  }, [players]);

  const handleAnswer = useCallback((selectedAnswer: string) => {
    if (!currentQuestion || answerSelected) return;
    
    setAnswerSelected(true);
    const player = players[currentPlayerIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    
    let newPosition = player.position;
    let newScore = player.score;
    let effectApplied = null;
    
    if (correct) {
      // Move forward on correct answer
      newPosition = Math.min(player.position + 1, MAX_POSITION);
      newScore += 10;
      
      // Process square effects
      const { 
        newPosition: updatedPosition, 
        newScore: updatedScore, 
        skipNextTurn, 
        effectDescription 
      } = processSquareEffect(
        { ...player, position: newPosition, score: newScore },
        newPosition
      );
      
      newPosition = updatedPosition;
      newScore = updatedScore;
      
      if (skipNextTurn) {
        setPlayers(prev => 
          prev.map(p => 
            p.id === player.id ? { ...p, skipNextTurn: true } : p
          )
        );
      }
      
      if (effectDescription) {
        effectApplied = { description: effectDescription };
      }
    }
    
    // Update player position and score
    setPlayers(prev => 
      prev.map(p => 
        p.id === player.id ? { ...p, position: newPosition, score: newScore } : p
      )
    );
    
    // Show appropriate toast
    if (correct) {
      toast({
        title: "Correct Answer!",
        description: `${player.name} gains 10 points and moves forward.`,
        variant: "default"
      });
      
      if (effectApplied) {
        toast({
          title: "Square Effect",
          description: effectApplied.description
        });
      }
    } else {
      toast({
        title: "Wrong Answer!",
        description: `The correct answer was: ${currentQuestion.correctAnswer}`,
        variant: "destructive"
      });
    }
    
    // Check if player reached the final square
    if (newPosition === MAX_POSITION) {
      endGame(player.id);
      return;
    }
    
    // Show question for a bit, then hide it
    setTimeout(() => {
      setShowQuestion(false);
      setCurrentQuestion(null);
      
      // Move to next player after a short delay
      setTimeout(() => {
        moveToNextPlayer();
      }, 1000);
    }, 2000);
    
  }, [currentQuestion, currentPlayerIndex, players, answerSelected, endGame, moveToNextPlayer]);

  // Function to automatically handle when time runs out
  const autoAnswer = useCallback(() => {
    if (!currentQuestion || answerSelected) return;
    
    setAnswerSelected(true);
    
    // Choose a wrong answer (not the correct one)
    const wrongOptions = currentQuestion.options.filter(
      option => option !== currentQuestion.correctAnswer
    );
    const randomWrongOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    
    toast({
      title: "Time Expired",
      description: `The correct answer was: ${currentQuestion.correctAnswer}`,
      variant: "destructive"
    });
    
    // Show question briefly, then hide it
    setTimeout(() => {
      setShowQuestion(false);
      setCurrentQuestion(null);
      
      // Move to next player after a short delay
      setTimeout(() => {
        moveToNextPlayer();
      }, 1000);
    }, 2000);
  }, [currentQuestion, answerSelected, moveToNextPlayer]);

  const resetGame = useCallback(() => {
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setCurrentQuestion(null);
    setGameMode("single");
    setGameStatus("setup");
    setRound(1);
    setShowQuestion(false);
    setAnswerSelected(false);
    usedQuestionIds.current.clear(); // Reset used questions
  }, []);

  return {
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
    autoAnswer,
    resetGame,
    MAX_ROUNDS
  };
};
