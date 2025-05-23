import { useState, useCallback, useRef } from 'react';
import { Player, Question, GameMode, GameStatus } from '@/types/game';
import { toast } from '@/components/ui/use-toast';
import { MAX_ROUNDS, MAX_POSITION, processSquareEffect } from './gameUtils';
import { fetchQuestions } from './apiUtils';
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
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  
  const usedQuestionIds = useRef<Set<number>>(new Set());

  const moveToNextPlayer = useCallback(() => {
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    
    if (nextPlayerIndex === 0) {
      const newRound = round + 1;
      setRound(newRound);
      
      if (newRound > MAX_ROUNDS) {
        endGame();
        return;
      }
    }
  }, [currentPlayerIndex, players.length, round]);

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
    usedQuestionIds.current.clear();
    
    toast({
      title: "Game Started!",
      description: `${playerNames.join(" and ")} are ready to play!`
    });
  }, []);

  const startTurn = useCallback(async () => {
    const player = players[currentPlayerIndex];
    
    if (player.skipNextTurn) {
      toast({
        title: "Turn Skipped",
        description: `${player.name}'s turn is skipped this round.`,
        variant: "destructive"
      });
      
      setPlayers(prev => 
        prev.map(p => 
          p.id === player.id ? { ...p, skipNextTurn: false } : p
        )
      );
      
      moveToNextPlayer();
      return;
    }
    
    setLoadingQuestion(true);
    try {
      // Fetch a question from the API
      const response = await fetchQuestions();
      
      if (response.error || !response.data || response.data.length === 0) {
        toast({
          title: "Error",
          description: "Failed to load question. Please check API configuration.",
          variant: "destructive"
        });
        console.error("API error:", response.error);
        setLoadingQuestion(false);
        return;
      }
      
      // Get a random question from the response
      const questions = response.data;
      const availableQuestions = questions.filter(q => !usedQuestionIds.current.has(q.id));
      
      // If we've used too many questions, reset the used IDs
      if (availableQuestions.length === 0 && questions.length > 0) {
        console.log("All questions have been used, resetting used question IDs");
        usedQuestionIds.current.clear();
      }
      
      // Select a random question
      const questionPool = availableQuestions.length > 0 ? availableQuestions : questions;
      const randomIndex = Math.floor(Math.random() * questionPool.length);
      const selectedQuestion = questionPool[randomIndex];
      
      // Mark this question as used
      usedQuestionIds.current.add(selectedQuestion.id);
      
      setCurrentQuestion(selectedQuestion);
      setShowQuestion(true);
      setAnswerSelected(false);
    } catch (error) {
      console.error('Failed to fetch question:', error);
      toast({
        title: "Error",
        description: "Failed to load question. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingQuestion(false);
    }
  }, [currentPlayerIndex, players, moveToNextPlayer]);

  const endGame = useCallback((winnerId?: number) => {
    if (winnerId) {
      toast({
        title: "Game Over!",
        description: `${players.find(p => p.id === winnerId)?.name} reached the end and wins!`
      });
    } else {
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
      newPosition = Math.min(player.position + 1, MAX_POSITION);
      newScore += 10;
      
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
    
    setPlayers(prev => 
      prev.map(p => 
        p.id === player.id ? { ...p, position: newPosition, score: newScore } : p
      )
    );
    
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
    
    if (newPosition === MAX_POSITION) {
      endGame(player.id);
      return;
    }
    
    setTimeout(() => {
      setShowQuestion(false);
      setCurrentQuestion(null);
      
      setTimeout(() => {
        moveToNextPlayer();
      }, 1000);
    }, 2000);
  }, [currentQuestion, currentPlayerIndex, players, answerSelected, endGame, moveToNextPlayer]);

  const autoAnswer = useCallback(() => {
    if (!currentQuestion || answerSelected) return;
    
    setAnswerSelected(true);
    
    const wrongOptions = currentQuestion.options.filter(
      option => option !== currentQuestion.correctAnswer
    );
    const randomWrongOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    
    toast({
      title: "Time Expired",
      description: `The correct answer was: ${currentQuestion.correctAnswer}`,
      variant: "destructive"
    });
    
    setTimeout(() => {
      setShowQuestion(false);
      setCurrentQuestion(null);
      
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
    usedQuestionIds.current.clear();
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
    loadingQuestion,
    initializeGame,
    startTurn,
    handleAnswer,
    autoAnswer,
    resetGame,
    MAX_ROUNDS
  };
};
