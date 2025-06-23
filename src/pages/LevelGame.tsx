
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, RotateCcw, Home } from 'lucide-react';
import QuestionCard from '@/components/QuestionCard';
import { levelQuestions } from '@/data/levelQuestions';
import { Question } from '@/types/game';
import { toast } from 'sonner';

const LevelGame: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const level = levelId ? parseInt(levelId) : 1;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15);
  
  const questions = levelQuestions[level as keyof typeof levelQuestions] || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer pentru întrebări
  useEffect(() => {
    if (!answerSelected && !gameCompleted && currentQuestion) {
      setTimeRemaining(15);
      
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAnswer(""); // Răspuns gol pentru timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, answerSelected, gameCompleted, currentQuestion]);

  const handleAnswer = (selectedAnswer: string) => {
    if (answerSelected) return;
    
    setAnswerSelected(true);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      toast.success("Răspuns corect!");
    } else if (selectedAnswer === "") {
      toast.error("Timpul a expirat!");
    } else {
      toast.error("Răspuns greșit!");
    }
    
    // Treci la următoarea întrebare după 2 secunde
    setTimeout(() => {
      if (currentQuestionIndex + 1 >= totalQuestions) {
        completeLevel();
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setAnswerSelected(false);
      }
    }, 2000);
  };

  const completeLevel = () => {
    setGameCompleted(true);
    
    // Salvează progresul în localStorage
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    if (!completedLevels.includes(level)) {
      completedLevels.push(level);
      localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
    }
    
    // Salvează scorul pentru acest nivel
    const levelScores = JSON.parse(localStorage.getItem('levelScores') || '{}');
    const currentBest = levelScores[level] || 0;
    if (score > currentBest) {
      levelScores[level] = score;
      localStorage.setItem('levelScores', JSON.stringify(levelScores));
      toast.success("Nou record personal!");
    }
  };

  const restartLevel = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setAnswerSelected(false);
    setGameCompleted(false);
    setTimeRemaining(15);
  };

  const getDifficultyLabel = (level: number) => {
    const labels = {
      1: "Ușor",
      2: "Mediu-Ușor", 
      3: "Mediu",
      4: "Greu",
      5: "Foarte Greu"
    };
    return labels[level as keyof typeof labels] || "Necunoscut";
  };

  if (!currentQuestion && !gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-game-background to-white flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-lg">Nivel invalid sau întrebări lipsă!</p>
          <Button onClick={() => navigate('/game-modes')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Înapoi la Nivele
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-background to-white">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/game-modes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Nivel {level}</h1>
            <Badge variant="secondary">{getDifficultyLabel(level)}</Badge>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Scor</p>
            <p className="text-xl font-bold text-primary">{score}</p>
          </div>
        </div>

        {!gameCompleted ? (
          <>
            {/* Progress Bar */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Întrebarea {currentQuestionIndex + 1} din {totalQuestions}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Timp rămas: {timeRemaining}s
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </CardContent>
            </Card>

            {/* Question */}
            <QuestionCard 
              question={currentQuestion}
              onAnswer={handleAnswer}
              answerSelected={answerSelected}
            />
          </>
        ) : (
          /* Game Completed */
          <div className="flex justify-center items-center min-h-[60vh]">
            <Card className="w-full max-w-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Trophy className="h-16 w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-3xl font-bold text-primary">
                  Nivel Completat!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">{score} puncte</p>
                    <p className="text-muted-foreground">
                      {correctAnswers} din {totalQuestions} răspunsuri corecte
                    </p>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Performanța ta</p>
                    <div className="flex justify-center">
                      <Progress value={(correctAnswers / totalQuestions) * 100} className="w-32 h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((correctAnswers / totalQuestions) * 100)}%
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button onClick={restartLevel} className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Joacă din nou
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/game-modes')} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Înapoi la Nivele
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Meniu Principal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelGame;
