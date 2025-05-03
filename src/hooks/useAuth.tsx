
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change event:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Session found" : "No session");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    signIn: async (username: string, password: string) => {
      try {
        console.log(`Attempting to sign in user: ${username}`);
        // Note: Supabase still requires email for sign in, we'll need to handle this
        // For this simplified version, we'll assume username is email
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username, // Using username as email for simplicity
          password,
        });
        
        if (error) {
          console.error("Login error:", error.message);
          toast.error(error.message || "Login failed");
          throw error;
        }
        
        console.log("Sign in successful:", data);
        toast.success("Login successful!");
        return { data, error: null };
      } catch (error: any) {
        console.error("Login error:", error.message);
        return { data: null, error };
      }
    },
    signUp: async (username: string, password: string) => {
      try {
        console.log(`Attempting to sign up user with username: ${username}`);
        // For this simplified version, we'll use username as both email and username
        const { data, error } = await supabase.auth.signUp({
          email: `${username}@example.com`, // Creating a fake email
          password,
          options: {
            data: { username },
          },
        });
        
        if (error) {
          console.error("Signup error:", error.message);
          toast.error(error.message || "Registration failed");
          throw error;
        }
        
        console.log("Sign up successful:", data);
        toast.success("Account created successfully!");
        return { data, error: null };
      } catch (error: any) {
        console.error("Signup error:", error.message);
        return { data: null, error };
      }
    },
    signOut: async () => {
      try {
        console.log("Attempting to sign out");
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Logout error:", error.message);
          toast.error(error.message || "Logout failed");
          throw error;
        }
        console.log("Sign out successful");
        toast.success("Logout successful");
        return { error: null };
      } catch (error: any) {
        console.error("Logout error:", error.message);
        return { error };
      }
    }
  };
}
