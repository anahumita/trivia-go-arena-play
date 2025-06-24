import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Eye, EyeOff, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (user) {
      console.log("User authenticated, redirecting to home");
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const grantAdminAccess = async () => {
    try {
      const adminEmail = 'cristian.curea03@e-uvt.ro';
      
      // First, check if user exists in our custom users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminEmail)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking user:', checkError);
        toast.error('Error checking user');
        return;
      }

      if (!existingUser) {
        toast.error('User not found. User must register first.');
        return;
      }

      // Update user to have admin role by updating their metadata
      // Note: This is a simple approach. In production, you'd want proper role management
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          username: existingUser.username + ' (Admin)' // Simple way to mark as admin
        })
        .eq('email', adminEmail);

      if (updateError) {
        console.error('Error granting admin access:', updateError);
        toast.error('Failed to grant admin access');
        return;
      }

      toast.success(`Admin access granted to ${adminEmail}`);
    } catch (error) {
      console.error('Error granting admin access:', error);
      toast.error('Failed to grant admin access');
    }
  };

  const validateForm = () => {
    if (activeTab === 'signup') {
      if (!formData.username) {
        toast.error('Username is required');
        return false;
      }
      if (!formData.email) {
        toast.error('Email is required');
        return false;
      }
      if (!formData.password) {
        toast.error('Password is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return false;
      }
    } else {
      if (!formData.email) {
        toast.error('Email is required');
        return false;
      }
      if (!formData.password) {
        toast.error('Password is required');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formLoading) return;
    
    setFormLoading(true);
    
    try {
      if (activeTab === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setFormLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          setFormLoading(false);
          return;
        }
        
        console.log(`Attempting signup for: ${formData.username} (${formData.email})`);
        const { data, error } = await signUp(formData.username, formData.email, formData.password);
        
        if (error) {
          console.error('Signup error:', error);
          toast.error(error.message || 'Registration failed');
        } else if (data?.user) {
          if (data.user.email_confirmed_at) {
            toast.success('Registration successful! You are now logged in.');
          } else {
            toast.success('Registration successful! Please check your email to confirm your account before logging in.');
          }
        }
      } else {
        console.log(`Attempting login for: ${formData.email}`);
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          console.error('Login error:', error);
          if (error.message?.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message?.includes('Email not confirmed')) {
            toast.error('Please check your email and confirm your account before logging in.');
          } else {
            toast.error(error.message || 'Login failed');
          }
        } else if (data?.user) {
          console.log('Login successful, user:', data.user);
        }
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome to Trivia Quest</h1>
          <p className="text-gray-600">Sign in to start your trivia adventure</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <TabsContent value="login" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min. 6 characters)"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={formLoading || loading}
                >
                  {formLoading ? 'Processing...' : activeTab === 'login' ? 'Sign In' : 'Sign Up'}
                </Button>
              </form>
            </Tabs>

            {/* Admin Access Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={grantAdminAccess}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Crown className="h-4 w-4" />
                Grant Admin Access to cristian.curea03@e-uvt.ro
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click to grant admin privileges to the specified email
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
