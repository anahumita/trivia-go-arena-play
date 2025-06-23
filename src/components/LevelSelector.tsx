import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelSelectorProps {
  onSelectLevel: (level: number) => void;
  completedLevels?: number[];
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ onSelectLevel, completedLevels = [] }) => {
  const levels = [
    { number: 1, title: "Level 1", difficulty: "Easy", color: "bg-green-100 border-green-300", icon: "🌱" },
    { number: 2, title: "Level 2", difficulty: "Medium-Easy", color: "bg-blue-100 border-blue-300", icon: "🌊" },
    { number: 3, title: "Level 3", difficulty: "Medium", color: "bg-yellow-100 border-yellow-300", icon: "⚡" },
    { number: 4, title: "Level 4", difficulty: "Hard", color: "bg-orange-100 border-orange-300", icon: "🔥" },
    { number: 5, title: "Level 5", difficulty: "Very Hard", color: "bg-red-100 border-red-300", icon: "💎" }
  ];

  const isLevelUnlocked = (levelNumber: number) => {
    // First level is always unlocked
    if (levelNumber === 1) return true;
    // Other levels are unlocked if the previous level was completed
    return completedLevels.includes(levelNumber - 1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">Game Modes</h2>
        <p className="text-muted-foreground">
          Choose a level and test your knowledge with 10 predefined questions
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {levels.map((level) => {
          const isUnlocked = isLevelUnlocked(level.number);
          const isCompleted = completedLevels.includes(level.number);
          
          return (
            <Card 
              key={level.number} 
              className={cn(
                "transition-all duration-200 hover:shadow-lg",
                level.color,
                !isUnlocked && "opacity-50 cursor-not-allowed",
                isCompleted && "ring-2 ring-yellow-400"
              )}
            >
              <CardHeader className="text-center pb-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">{level.icon}</span>
                  {isCompleted && <Trophy className="h-5 w-5 text-yellow-500" />}
                  {!isUnlocked && <Lock className="h-5 w-5 text-gray-400" />}
                </div>
                <CardTitle className="text-xl">{level.title}</CardTitle>
                <Badge variant="secondary" className="mx-auto">
                  {level.difficulty}
                </Badge>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  10 {level.difficulty.toLowerCase()} questions
                </p>
                <Button 
                  onClick={() => onSelectLevel(level.number)}
                  disabled={!isUnlocked}
                  className="w-full"
                  variant={isCompleted ? "default" : "outline"}
                >
                  {isCompleted ? "Play again" : !isUnlocked ? "Locked" : "Start level"}
                </Button>
                {isCompleted && (
                  <div className="flex justify-center mt-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelector;
