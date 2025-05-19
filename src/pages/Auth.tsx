
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Only redirect if user is logged in AND not in loading state AND auth check has completed
  useEffect(() => {
    console.log("Auth page - User state:", user ? "Logged in" : "Not logged in", "Loading:", loading);
    
    if (!loading) {
      setAuthChecked(true);
      if (user) {
        console.log("Redirecting authenticated user to dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!username.trim()) {
      toast.error("Please enter a username");
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log("Attempting signup with:", { username, email });
      const { data, error } = await signUp(username, email, password);

      if (error) {
        console.error("Signup error:", error);
        toast.error(error.message || "Registration failed");
      } else {
        toast.success("Registration successful!");
        setShowConfirmDialog(true);
      }
    } catch (error: any) {
      console.error("Exception during signup:", error);
      toast.error(error.message || "An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log("Attempting login with:", { email });
      const { data, error } = await signIn(email, password);

      if (error) {
        console.error("Login error:", error);
        
        if (error.message?.includes("Email not confirmed")) {
          toast.error("Please check your email and confirm your account before logging in");
          setShowConfirmDialog(true);
        } else {
          toast.error(error.message || "Invalid login credentials");
        }
      } else {
        toast.success("Successfully logged in!");
        navigate("/dashboard", { replace: true });
      }
    } catch (error: any) {
      console.error("Exception during login:", error);
      toast.error(error.message || "An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setShowConfirmDialog(false);
  };

  // If still loading, show a loading indicator that's not part of the normal auth flow
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-game-background to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // Only show the redirect on initial load, not on subsequent auth checks
  // if user exists and authChecked is true, don't render the auth form
  if (user && authChecked) {
    return null;
  }

  // Only render the login form if we've confirmed the user is not logged in
  return (
    <div className="min-h-screen bg-gradient-to-b from-game-background to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-primary">
            Welcome to TriviaGo
          </CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Choose a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>

      {/* Email Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Confirmation Required</DialogTitle>
            <DialogDescription className="py-4">
              <p className="mb-4">
                We've sent a confirmation email to <strong>{email}</strong>. Please check your inbox and click the confirmation link to activate your account.
              </p>
              <p className="mb-4">
                If you don't see the email, please check your spam folder.
              </p>
              <Button onClick={handleCloseDialog} className="w-full">
                I'll check my email
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
