
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
    { number: 1, title: "Nivel 1", difficulty: "Ușor", color: "bg-green-100 border-green-300", icon: "🌱" },
    { number: 2, title: "Nivel 2", difficulty: "Mediu-Ușor", color: "bg-blue-100 border-blue-300", icon: "🌊" },
    { number: 3, title: "Nivel 3", difficulty: "Mediu", color: "bg-yellow-100 border-yellow-300", icon: "⚡" },
    { number: 4, title: "Nivel 4", difficulty: "Greu", color: "bg-orange-100 border-orange-300", icon: "🔥" },
    { number: 5, title: "Nivel 5", difficulty: "Foarte Greu", color: "bg-red-100 border-red-300", icon: "💎" }
  ];

  const isLevelUnlocked = (levelNumber: number) => {
    // Primul nivel este mereu deblocat
    if (levelNumber === 1) return true;
    // Celelalte nivele sunt deblocate dacă nivelul anterior a fost completat
    return completedLevels.includes(levelNumber - 1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">Moduri de Joc</h2>
        <p className="text-muted-foreground">
          Alege un nivel și testează-ți cunoștințele cu 10 întrebări predefinite
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
                  10 întrebări {level.difficulty.toLowerCase()}
                </p>
                <Button 
                  onClick={() => onSelectLevel(level.number)}
                  disabled={!isUnlocked}
                  className="w-full"
                  variant={isCompleted ? "default" : "outline"}
                >
                  {isCompleted ? "Joacă din nou" : !isUnlocked ? "Blocat" : "Începe nivelul"}
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
