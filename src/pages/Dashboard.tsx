
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Brain, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast.error('Failed to log out. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-game-background to-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Game Dashboard</h1>
          <p className="text-muted-foreground">
            Hello, <span className="font-semibold">{user?.user_metadata?.username || user?.email?.split('@')[0] || 'Player'}</span>! Track your gaming progress and start new games
          </p>
        </header>

        <div className="max-w-3xl mx-auto grid gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6" />
                Quick Actions
              </h2>
              <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
            <div className="space-y-4">
              <Button asChild className="w-full justify-start" size="lg">
                <Link to="/game">
                  <Brain className="mr-2 h-5 w-5" />
                  Start New Game
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline" size="lg">
                <Link to="/">
                  <User className="mr-2 h-5 w-5" />
                  View Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
