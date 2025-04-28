import { supabase } from "@/integrations/supabase/client";
import { Player, Question } from "@/types/game";
import { mockQuestions } from "@/data/mockQuestions";
import { gameBoard } from "@/data/gameBoard";
import { toast } from "@/components/ui/use-toast";
import { GameState } from "./types";

export const MAX_ROUNDS = 10;
export const MAX_POSITION = gameBoard.length - 1;

export const getRandomQuestion = async (usedQuestionIds: Set<number>): Promise<Question> => {
  // Try to fetch a random question from Supabase
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .not('id', 'in', Array.from(usedQuestionIds))
    .limit(1)
    .order('RANDOM()');

  // If there's an error or no questions found, fallback to mock questions
  if (error || !questions || questions.length === 0) {
    console.warn('Failed to fetch questions from database, using mock data:', error);
    
    // Use the existing mock data logic as fallback
    if (usedQuestionIds.size >= mockQuestions.length * 0.75) {
      usedQuestionIds.clear();
    }
    
    const availableQuestions = mockQuestions.filter(q => !usedQuestionIds.has(q.id));
    const questionPool = availableQuestions.length > 0 ? availableQuestions : mockQuestions;
    const randomIndex = Math.floor(Math.random() * questionPool.length);
    const selectedQuestion = questionPool[randomIndex];
    
    usedQuestionIds.add(Number(selectedQuestion.id));
    return selectedQuestion;
  }

  // Map Supabase question to our Question type
  const dbQuestion = questions[0];
  const question: Question = {
    id: Number(dbQuestion.id),
    question: dbQuestion.question,
    correctAnswer: dbQuestion.correct_answer,
    options: dbQuestion.options,
    category: dbQuestion.category,
    difficulty: dbQuestion.difficulty
  };

  // Add the question ID to used IDs set
  usedQuestionIds.add(Number(question.id));
  return question;
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
