
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Trophy, RotateCcw, Home, Mail, LogOut } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import QuestionCard from '@/components/QuestionCard';
import { Question } from '@/types/game';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const LevelGame: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const level = levelId ? parseInt(levelId) : 1;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [loading, setLoading] = useState(true);
  const [playerEmail, setPlayerEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = 10; // Fixed to 10 questions per level
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Load questions from database
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // Get questions from database - limit to 10 per level
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .limit(10)
          .order('id'); // Keep consistent order, not random
        
        if (error) {
          console.error('Error loading questions:', error);
          toast.error('Failed to load questions');
          return;
        }
        
        if (!data || data.length === 0) {
          toast.error('No questions available');
          return;
        }
        
        // Transform questions to match our format
        const transformedQuestions: Question[] = data.map(q => ({
          id: hashStringToNumber(q.id),
          question: q.question,
          correctAnswer: q.correct_answer,
          options: q.options,
          category: q.category,
          difficulty: q.difficulty as "easy" | "medium" | "hard"
        }));
        
        setQuestions(transformedQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        toast.error('Failed to load questions');
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, [level]);

  // Timer for questions
  useEffect(() => {
    if (!answerSelected && !gameCompleted && currentQuestion && !loading) {
      setTimeRemaining(15);
      
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAnswer(""); // Empty answer for timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, answerSelected, gameCompleted, currentQuestion, loading]);

  const handleAnswer = (selectedAnswer: string) => {
    if (answerSelected) return;
    
    setAnswerSelected(true);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      toast.success("Correct answer!");
    } else if (selectedAnswer === "") {
      toast.error("Time expired!");
    } else {
      toast.error("Wrong answer!");
    }
    
    // Move to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex + 1 >= totalQuestions) {
        completeLevel();
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setAnswerSelected(false);
      }
    }, 2000);
  };

  const handleExitGame = () => {
    completeLevel();
  };

  const completeLevel = () => {
    setGameCompleted(true);
    
    // Save progress to localStorage
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    if (!completedLevels.includes(level)) {
      completedLevels.push(level);
      localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
    }
    
    // Save score for this level
    const levelScores = JSON.parse(localStorage.getItem('levelScores') || '{}');
    const currentBest = levelScores[level] || 0;
    if (score > currentBest) {
      levelScores[level] = score;
      localStorage.setItem('levelScores', JSON.stringify(levelScores));
      toast.success("New personal record!");
    }
  };

  const sendScoreEmail = async () => {
    if (!playerEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      const { error } = await supabase.functions.invoke('send-score-email', {
        body: {
          email: playerEmail,
          level: level,
          score: score,
          correctAnswers: correctAnswers,
          totalQuestions: totalQuestions,
          percentage: Math.round((correctAnswers / totalQuestions) * 100)
        }
      });
      
      if (error) {
        console.error('Error sending email:', error);
        toast.error('Failed to send email');
      } else {
        toast.success('Score sent to your email!');
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
  };

  const restartLevel = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setAnswerSelected(false);
    setGameCompleted(false);
    setTimeRemaining(15);
    setEmailSent(false);
    setPlayerEmail('');
  };

  const getDifficultyLabel = (level: number) => {
    const labels = {
      1: "Easy",
      2: "Medium-Easy", 
      3: "Medium",
      4: "Hard",
      5: "Very Hard"
    };
    return labels[level as keyof typeof labels] || "Unknown";
  };

  // Hash function to convert UUID to number
  const hashStringToNumber = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-game-background to-white flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-lg">Loading questions...</p>
        </Card>
      </div>
    );
  }

  if (!currentQuestion && !gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-game-background to-white flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-lg">Invalid level or no questions available!</p>
          <Button onClick={() => navigate('/game-modes')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Levels
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
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Level {level}</h1>
            <Badge variant="secondary">{getDifficultyLabel(level)}</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-xl font-bold text-primary">{score}</p>
            </div>
            
            {/* Exit Game Button */}
            {!gameCompleted && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <LogOut className="h-4 w-4 mr-1" />
                    Exit
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Exit Game Early?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You can exit the game now and receive your current score. 
                      Unanswered questions will count as zero points. You'll still be able to email your results.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continue Playing</AlertDialogCancel>
                    <AlertDialogAction onClick={handleExitGame}>
                      Exit & Get Score
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {!gameCompleted ? (
          <>
            {/* Progress Bar */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Time remaining: {timeRemaining}s
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
                  Level Completed!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">{score} points</p>
                    <p className="text-muted-foreground">
                      {correctAnswers} of {totalQuestions} correct answers
                    </p>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Your performance</p>
                    <div className="flex justify-center">
                      <Progress value={(correctAnswers / totalQuestions) * 100} className="w-32 h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((correctAnswers / totalQuestions) * 100)}%
                    </p>
                  </div>
                  
                  {/* Email Score Section */}
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-blue-900">Get your score via email</p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={playerEmail}
                        onChange={(e) => setPlayerEmail(e.target.value)}
                        disabled={emailSent}
                        className="flex-1"
                      />
                      <Button 
                        onClick={sendScoreEmail}
                        disabled={emailSent || !playerEmail}
                        size="sm"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        {emailSent ? "Sent!" : "Send"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button onClick={restartLevel} className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Play again
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/game-modes')} className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Levels
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Main Menu
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
