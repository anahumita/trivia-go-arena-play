
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
  try {
    console.log("Fetching questions from database, excluding IDs:", Array.from(usedQuestionIds));
    
    // Query to get questions not in the used IDs list
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*');
    
    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    
    if (!questions || questions.length === 0) {
      console.warn("No questions found in database");
      throw new Error("No questions found in database");
    }
    
    console.log(`Found ${questions.length} questions in database`);
    
    // Filter out questions that have already been used
    const unusedQuestions = questions.filter(q => !usedQuestionIds.has(Number(q.id)));
    
    if (unusedQuestions.length === 0) {
      console.log("All questions have been used, clearing used IDs");
      usedQuestionIds.clear();
      // Now all questions are available again
    }
    
    // Select a random question from available questions
    const availableQuestions = unusedQuestions.length > 0 ? unusedQuestions : questions;
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const dbQuestion = availableQuestions[randomIndex];
    
    console.log("Selected question:", dbQuestion);
    
    // Validate and normalize difficulty
    let normalizedDifficulty: "easy" | "medium" | "hard" = "easy";
    
    if (dbQuestion.difficulty) {
      const difficultyLower = dbQuestion.difficulty.toLowerCase();
      if (difficultyLower === "easy" || difficultyLower === "medium" || difficultyLower === "hard") {
        normalizedDifficulty = difficultyLower as "easy" | "medium" | "hard";
      } else {
        console.warn(`Unknown difficulty level "${dbQuestion.difficulty}" found, defaulting to "easy"`);
      }
    }
    
    const question: Question = {
      id: Number(dbQuestion.id),
      question: dbQuestion.question,
      correctAnswer: dbQuestion.correct_answer,
      options: dbQuestion.options,
      category: dbQuestion.category,
      difficulty: normalizedDifficulty
    };

    // Add the question ID to used IDs set
    usedQuestionIds.add(Number(question.id));
    console.log("Successfully fetched question from database:", question);
    return question;
  } catch (error) {
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
