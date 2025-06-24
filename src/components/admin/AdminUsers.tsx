
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MoreHorizontal, Ban, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  last_login?: string;
}

interface UserStats {
  userId: string;
  totalGames: number;
  totalScore: number;
  averageScore: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error loading users:', usersError);
        toast.error('Failed to load users');
        return;
      }

      setUsers(usersData || []);

      // Load user statistics (this would require a games table in a real app)
      // For now, we'll use mock data
      const mockStats: Record<string, UserStats> = {};
      usersData?.forEach(user => {
        mockStats[user.id] = {
          userId: user.id,
          totalGames: Math.floor(Math.random() * 50) + 1,
          totalScore: Math.floor(Math.random() * 5000) + 100,
          averageScore: Math.floor(Math.random() * 80) + 20
        };
      });
      setUserStats(mockStats);

    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getActivityStatus = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    
    const daysSinceLogin = Math.floor(
      (new Date().getTime() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLogin === 0) return 'Today';
    if (daysSinceLogin === 1) return 'Yesterday';
    if (daysSinceLogin <= 7) return `${daysSinceLogin} days ago`;
    if (daysSinceLogin <= 30) return `${Math.floor(daysSinceLogin / 7)} weeks ago`;
    return `${Math.floor(daysSinceLogin / 30)} months ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Games Played</TableHead>
              <TableHead>Total Score</TableHead>
              <TableHead>Avg Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const stats = userStats[user.id];
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.username}</p>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>{getActivityStatus(user.last_login)}</TableCell>
                  <TableCell>{stats?.totalGames || 0}</TableCell>
                  <TableCell>{stats?.totalScore || 0}</TableCell>
                  <TableCell>{stats?.averageScore || 0}%</TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.last_login ? "default" : "secondary"}
                    >
                      {user.last_login ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
