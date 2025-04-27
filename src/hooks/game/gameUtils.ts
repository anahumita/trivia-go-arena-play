
import { Player, Question } from "@/types/game";
import { mockQuestions } from "@/data/mockQuestions";
import { gameBoard } from "@/data/gameBoard";
import { toast } from "@/components/ui/use-toast";
import { GameState } from "./types";

export const MAX_ROUNDS = 10;
export const MAX_POSITION = gameBoard.length - 1;

export const getRandomQuestion = (usedQuestionIds: Set<number>): Question => {
  // If all questions have been used, reset the used question IDs
  if (usedQuestionIds.size >= mockQuestions.length * 0.75) {
    usedQuestionIds.clear();
  }
  
  // Filter out questions that have already been used
  const availableQuestions = mockQuestions.filter(q => !usedQuestionIds.has(q.id));
  
  // If no available questions (shouldn't happen with the reset above), use all questions
  const questionPool = availableQuestions.length > 0 ? availableQuestions : mockQuestions;
  
  const randomIndex = Math.floor(Math.random() * questionPool.length);
  const selectedQuestion = questionPool[randomIndex];
  
  // Add the question ID to the used questions set
  usedQuestionIds.add(selectedQuestion.id);
  
  return selectedQuestion;
};

export const processSquareEffect = (player: Player, newPosition: number): {
  newPosition: number;
  newScore: number;
  skipNextTurn: boolean;
  effectDescription: string | null;
} => {
  let newScore = player.score;
  let skipNextTurn = false;
  let effectDescription = null;
  
  // Check if landed on special square
  if (newPosition > 0) {
    const square = gameBoard[newPosition];
    
    if (square.effect) {
      switch (square.effect.type) {
        case "points":
          newScore += square.effect.value;
          effectDescription = square.type === "bonus" 
            ? `Bonus! ${square.effect.value} extra points!` 
            : `Penalty! Lost ${Math.abs(square.effect.value)} points.`;
          break;
        case "position":
          newPosition = Math.max(0, Math.min(newPosition + square.effect.value, MAX_POSITION));
          effectDescription = square.type === "bonus"
            ? `Bonus! Moved forward ${square.effect.value} spaces.`
            : `Penalty! Moved back ${Math.abs(square.effect.value)} spaces.`;
          break;
        case "skip":
          skipNextTurn = true;
          effectDescription = "Skip! You'll miss your next turn.";
          break;
      }
    }
  }
  
  return { newPosition, newScore, skipNextTurn, effectDescription };
};

export const createInitialGameState = (): Omit<GameState, "usedQuestionIds"> => ({
  players: [],
  currentPlayerIndex: 0,
  currentQuestion: null,
  gameMode: "single",
  gameStatus: "setup",
  round: 1,
  showQuestion: false,
  answerSelected: false,
});

