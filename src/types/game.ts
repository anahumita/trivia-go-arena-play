
export interface Question {
  id: number;
  question: string;
  correctAnswer: string;
  options: string[];
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface Player {
  id: number;
  name: string;
  position: number;
  score: number;
  skipNextTurn: boolean;
}

export interface GameSquare {
  id: number;
  type: "normal" | "bonus" | "penalty" | "skip" | "final";
  effect?: {
    type: "points" | "position" | "skip";
    value: number;
  };
}

export type GameMode = "single" | "multiplayer";

export type GameStatus = "setup" | "playing" | "gameOver";
