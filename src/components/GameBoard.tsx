
import React from 'react';
import { gameBoard } from '@/data/gameBoard';
import { Player } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  players: Player[];
}

const getSquareTypeClass = (type: string) => {
  switch (type) {
    case 'bonus':
      return 'square-bonus';
    case 'penalty':
      return 'square-penalty';
    case 'skip':
      return 'square-penalty';
    case 'final':
      return 'bg-game-primary text-white';
    default:
      return 'square-normal';
  }
};

const getSquareContent = (type: string, effect?: { type: string; value: number }) => {
  switch (type) {
    case 'bonus':
      return effect?.type === 'points' 
        ? `+${effect.value} points` 
        : `Move +${effect?.value} spaces`;
    case 'penalty':
      return effect?.type === 'points' 
        ? `-${Math.abs(effect.value)} points` 
        : `Move back ${Math.abs(effect?.value)} spaces`;
    case 'skip':
      return 'Skip next turn';
    case 'final':
      return 'FINISH';
    default:
      return '';
  }
};

const GameBoard: React.FC<GameBoardProps> = ({ players }) => {
  // Create a zigzag pattern for the board
  const rows = [];
  const squaresPerRow = 5;
  const totalSquares = gameBoard.length;
  
  for (let i = 0; i < totalSquares; i += squaresPerRow) {
    const rowSquares = gameBoard.slice(i, i + squaresPerRow);
    // Reverse every other row to create zigzag
    if ((i / squaresPerRow) % 2 === 1) {
      rowSquares.reverse();
    }
    rows.push(rowSquares);
  }

  return (
    <div className="w-full overflow-x-auto p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {rows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className={cn(
              "flex mb-4", 
              rowIndex % 2 === 1 ? "flex-row-reverse" : "flex-row"
            )}
          >
            {row.map((square) => (
              <div
                key={square.id}
                className={cn(
                  "game-board-square flex-1 min-w-24 m-1",
                  getSquareTypeClass(square.type)
                )}
              >
                <div className="text-center">
                  <div className="font-bold">{square.id}</div>
                  <div className="text-xs">{getSquareContent(square.type, square.effect)}</div>
                </div>
                
                {/* Player tokens */}
                {players.map((player) => 
                  player.position === square.id ? (
                    <div 
                      key={player.id}
                      className={cn(
                        "player-token", 
                        `player-${player.id}`,
                        player.id === 1 ? "-top-3 -left-3" : "-top-3 -right-3"
                      )}
                      title={player.name}
                    />
                  ) : null
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
