
import React, { useState } from 'react';
import { Question } from '@/types/game';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  answerSelected: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, answerSelected }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleSelectAnswer = (answer: string) => {
    if (answerSelected) return;
    setSelectedAnswer(answer);
    onAnswer(answer);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 animate-fade-in">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Badge variant="outline">{question.category}</Badge>
            <Badge 
              variant={
                question.difficulty === 'easy' ? 'default' : 
                question.difficulty === 'medium' ? 'secondary' : 
                'destructive'
              }
            >
              {question.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-xl mt-2">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option) => (
              <Button
                key={option}
                variant={
                  answerSelected && option === question.correctAnswer
                    ? "default"
                    : answerSelected && option === selectedAnswer && option !== question.correctAnswer
                    ? "destructive"
                    : "outline"
                }
                className={cn(
                  "h-auto py-3 justify-start text-left",
                  selectedAnswer === option && !answerSelected && "border-primary"
                )}
                onClick={() => handleSelectAnswer(option)}
                disabled={answerSelected}
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
        {answerSelected && (
          <CardFooter className="flex justify-center">
            <div className="text-center">
              {selectedAnswer === question.correctAnswer ? (
                <p className="text-green-600 font-bold">Correct! Well done!</p>
              ) : (
                <p className="text-destructive font-bold">
                  Wrong! The correct answer is: {question.correctAnswer}
                </p>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default QuestionCard;
