
import React, { useState, useEffect } from 'react';
import { Question } from '@/types/game';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
    setSelectedAnswer(null);
    
    try {
      // Check if options exist and are valid
      if (!Array.isArray(question.options) || question.options.length === 0) {
        console.error("Invalid or missing options array:", question.options);
        // Create a default options array with the correct answer
        const defaultOptions = [question.correctAnswer, "Option 2", "Option 3", "Option 4"];
        setShuffledOptions(defaultOptions);
      } else {
        // Create a copy of the options array and shuffle it
        const shuffled = [...question.options].sort(() => Math.random() - 0.5);
        setShuffledOptions(shuffled);
      }
    } catch (error) {
      console.error("Error shuffling options:", error);
      // If there's an error, use the original options or create defaults
      const fallbackOptions = Array.isArray(question.options) ? question.options : [question.correctAnswer];
      setShuffledOptions(fallbackOptions);
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
    
    // Show toast feedback
    if (answer === question.correctAnswer) {
      toast.success("Correct answer!");
    } else {
      toast.error("Wrong answer!");
    }
  };

  // Decode HTML entities (for questions that may contain HTML entities from the API)
  const decodeHTML = (html: string) => {
    if (!html) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 animate-fade-in">
      <Card className="shadow-lg border-2 hover:border-primary/50 transition-all">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Badge 
              variant="outline" 
              className="text-xs font-medium bg-primary/10"
            >
              {question.category || 'General'}
            </Badge>
            <Badge 
              variant={
                question.difficulty === 'easy' ? 'default' : 
                question.difficulty === 'medium' ? 'secondary' : 
                'destructive'
              }
              className="text-xs font-medium"
            >
              {question.difficulty || 'medium'}
            </Badge>
          </div>
          <CardTitle className="text-xl mt-2 font-bold">
            {decodeHTML(question.question)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
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
                    "h-auto py-4 justify-start text-left transition-all",
                    selectedAnswer === option && !answerSelected && "border-primary border-2",
                    answerSelected && option === question.correctAnswer && "bg-green-600 hover:bg-green-600 text-white",
                    answerSelected && option === selectedAnswer && option !== question.correctAnswer && "bg-red-600 hover:bg-red-600 text-white"
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
          <CardFooter className="flex justify-center pt-2 pb-4">
            <div className="text-center">
              {selectedAnswer === question.correctAnswer ? (
                <p className="text-green-600 font-bold text-lg">Correct! Well done!</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-destructive font-bold text-lg">
                    Wrong! The correct answer is:
                  </p>
                  <p className="bg-green-50 p-2 rounded-md text-green-700 font-medium">
                    {decodeHTML(question.correctAnswer)}
                  </p>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default QuestionCard;
