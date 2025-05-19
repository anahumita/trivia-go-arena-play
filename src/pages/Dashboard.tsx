
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Brain, LogOut, User, Trophy, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { configureApiUrl } from '@/hooks/game/apiUtils';

interface LeaderboardEntry {
  id: string | number; // Changed to accept both string and number
  user_id: string;
  score: number;
  games_won: number;
  rank: number;
  strongest_category: string | null;
  username?: string;
  users?: { username: string };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user) return;
      
      try {
        // Get leaderboard entries with a direct join to users table to get usernames
        const { data, error } = await supabase
          .from('leaderboard')
          .select(`
            *,
            users!leaderboard_user_id_fkey (
              username
            )
          `)
          .order('score', { ascending: false });
        
        console.log("Leaderboard fetch response:", { data, error });
        
        if (error) {
          console.error('Error fetching leaderboard:', error);
          toast.error('Failed to load leaderboard data');
          return;
        }
        
        // Format the data to include username and handle any type inconsistencies
        const formattedData = data.map(entry => ({
          ...entry,
          id: entry.id, // Ensure id exists (will be either string or number)
          username: entry.users?.username || 'Unknown Player',
          strongest_category: entry.strongest_category || 'General Knowledge'
        }));
        
        console.log("Formatted leaderboard data:", formattedData);
        setLeaderboard(formattedData as LeaderboardEntry[]);
      } catch (error) {
        console.error('Exception fetching leaderboard:', error);
        toast.error('An error occurred while loading the leaderboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [user]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to log out. Please try again.');
    }
  };
  
  const handleApiConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiUrl) {
      configureApiUrl(apiUrl);
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
                <Link to="/profile">
                  <User className="mr-2 h-5 w-5" />
                  View Profile
                </Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="w-full justify-start" size="lg">
                    <Settings className="mr-2 h-5 w-5" />
                    Configure API
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>API Configuration</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleApiConfigSubmit} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="apiUrl">Swagger API URL</Label>
                      <Input 
                        id="apiUrl" 
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="https://your-swagger-api.com/api"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the base URL for your Swagger API. This will be used for fetching questions and storing game data.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save Configuration</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Leaderboard
            </h2>
            
            {loading ? (
              <div className="text-center py-8">Loading leaderboard data...</div>
            ) : leaderboard.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Games Won</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow key={entry.id} className={user?.id === entry.user_id ? "bg-primary/10" : ""}>
                      <TableCell>{entry.rank || index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {entry.username}
                        {user?.id === entry.user_id && <span className="ml-1 text-xs">(You)</span>}
                      </TableCell>
                      <TableCell>{entry.score}</TableCell>
                      <TableCell>{entry.games_won}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                No leaderboard data available yet. Play some games to see your scores!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
