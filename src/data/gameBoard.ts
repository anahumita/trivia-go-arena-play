
import { GameSquare } from "../types/game";

export const gameBoard: GameSquare[] = [
  {
    id: 0,
    type: "normal",
  },
  {
    id: 1,
    type: "normal",
  },
  {
    id: 2,
    type: "bonus",
    effect: {
      type: "points",
      value: 5
    }
  },
  {
    id: 3,
    type: "normal",
  },
  {
    id: 4,
    type: "normal",
  },
  {
    id: 5,
    type: "penalty",
    effect: {
      type: "position",
      value: -2
    }
  },
  {
    id: 6,
    type: "normal",
  },
  {
    id: 7,
    type: "skip",
    effect: {
      type: "skip",
      value: 1
    }
  },
  {
    id: 8,
    type: "normal",
  },
  {
    id: 9,
    type: "bonus",
    effect: {
      type: "points",
      value: 10
    }
  },
  {
    id: 10,
    type: "normal",
  },
  {
    id: 11,
    type: "normal",
  },
  {
    id: 12,
    type: "penalty",
    effect: {
      type: "points",
      value: -5
    }
  },
  {
    id: 13,
    type: "normal",
  },
  {
    id: 14,
    type: "normal",
  },
  {
    id: 15,
    type: "bonus",
    effect: {
      type: "position",
      value: 2
    }
  },
  {
    id: 16,
    type: "normal",
  },
  {
    id: 17,
    type: "normal",
  },
  {
    id: 18,
    type: "skip",
    effect: {
      type: "skip",
      value: 1
    }
  },
  {
    id: 19,
    type: "normal",
  },
  {
    id: 20,
    type: "normal",
  },
  {
    id: 21,
    type: "bonus",
    effect: {
      type: "points",
      value: 15
    }
  },
  {
    id: 22,
    type: "normal",
  },
  {
    id: 23,
    type: "normal",
  },
  {
    id: 24,
    type: "final",
  }
];
