
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LevelSelector from '@/components/LevelSelector';
import ExitButton from '@/components/ExitButton';

const GameModes: React.FC = () => {
  const navigate = useNavigate();
  const [completedLevels] = useState<number[]>(() => {
    // Load completed levels from localStorage
    const saved = localStorage.getItem('completedLevels');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSelectLevel = (level: number) => {
    navigate(`/level-game/${level}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-background to-white">
      <div className="container mx-auto py-6 px-4">
        <ExitButton />
        <LevelSelector 
          onSelectLevel={handleSelectLevel} 
          completedLevels={completedLevels}
        />
      </div>
    </div>
  );
};

export default GameModes;
