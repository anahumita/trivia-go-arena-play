
import React, { useState, useEffect } from 'react';
import { Question } from '@/types/game';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  answerSelected: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, answerSelected }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Shuffle options when the question changes
  useEffect(() => {
    setIsLoading(true);
    
    try {
      // Create a copy of the options array and shuffle it
      const shuffled = [...question.options].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);
    } catch (error) {
      console.error("Error shuffling options:", error);
      // If there's an error, use the original options
      setShuffledOptions(question.options);
    }
    
    // Add a short delay to prevent UI flicker
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [question]);

  const handleSelectAnswer = (answer: string) => {
    if (answerSelected) return;
    setSelectedAnswer(answer);
    onAnswer(answer);
  };

  // Decode HTML entities (for questions that may contain HTML entities from the API)
  const decodeHTML = (html: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
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
          <CardTitle className="text-xl mt-2">{decodeHTML(question.question)}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shuffledOptions.map((option) => (
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
                  {decodeHTML(option)}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
        {answerSelected && (
          <CardFooter className="flex justify-center">
            <div className="text-center">
              {selectedAnswer === question.correctAnswer ? (
                <p className="text-green-600 font-bold">Correct! Well done!</p>
              ) : (
                <p className="text-destructive font-bold">
                  Wrong! The correct answer is: {decodeHTML(question.correctAnswer)}
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
