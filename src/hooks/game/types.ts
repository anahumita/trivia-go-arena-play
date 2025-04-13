
import { GameMode, GameStatus, Player, Question } from "@/types/game";

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  currentQuestion: Question | null;
  gameMode: GameMode;
  gameStatus: GameStatus;
  round: number;
  showQuestion: boolean;
  answerSelected: boolean;
  usedQuestionIds: Set<number>;
}

export interface GameStateContextType extends GameState {
  initializeGame: (mode: GameMode, playerNames: string[]) => void;
  startTurn: () => void;
  handleAnswer: (selectedAnswer: string) => void;
  resetGame: () => void;
  autoAnswer: () => void;
  MAX_ROUNDS: number;
}
