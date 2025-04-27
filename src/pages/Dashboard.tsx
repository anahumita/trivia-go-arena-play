
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Brain } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-game-background to-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Game Dashboard</h1>
          <p className="text-muted-foreground">Track your gaming progress and start new games</p>
        </header>

        <div className="max-w-3xl mx-auto grid gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6" />
                Quick Actions
              </h2>
            </div>
            <div className="space-y-4">
              <Button asChild className="w-full justify-start" size="lg">
                <Link to="/game">
                  <Brain className="mr-2 h-5 w-5" />
                  Start New Game
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
