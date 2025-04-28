import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Award, Users, Brain, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-game-background to-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
            TriviaGo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test your knowledge, race to the finish, and outsmart your opponents in this interactive trivia board game!
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center mb-12 gap-8 animate-fade-in">
            <Button asChild className="h-auto py-8 px-6 text-lg" size="lg">
              <Link to="/game">
                Start Playing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {user ? (
              <Button asChild variant="outline" className="h-auto py-8 px-6 text-lg" size="lg">
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="h-auto py-8 px-6 text-lg" size="lg">
                <Link to="/auth">
                  Sign In / Register
                </Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-game-board">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Test Your Knowledge</h3>
              <p className="text-muted-foreground text-center">
                Answer questions from various categories and difficulties to advance on the board.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-game-board">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Single or Multiplayer</h3>
              <p className="text-muted-foreground text-center">
                Play solo to challenge yourself or compete with a friend in two-player mode.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-game-board">
                  <Award className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Special Squares</h3>
              <p className="text-muted-foreground text-center">
                Land on surprise squares that can boost your score or create unexpected challenges.
              </p>
            </div>
          </div>

          <div className="text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button asChild variant="ghost" size="lg">
              <Link to="/game" className="text-lg">
                Let's Play!
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
