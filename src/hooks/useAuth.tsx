
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log("useAuth hook - Setting up auth state listener");
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (mounted) {
          console.log("Auth state change event:", event);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Only set loading to false after initial loading
          if (initialized) {
            setLoading(false);
          }
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          console.log("Initial session check:", currentSession ? "Session found" : "No session");
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    checkSession();

    return () => {
      console.log("useAuth hook - Unsubscribing from auth state changes");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to save user data to users table
  const saveUserToCustomTable = async (userId: string, email: string, username: string) => {
    try {
      // Check if user already exists in custom table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error("Error checking for existing user:", checkError);
        return { error: checkError };
      }
      
      if (existingUser) {
        console.log("User already exists in custom table, updating last_login");
        const { error: updateError } = await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userId);
          
        if (updateError) {
          console.error("Error updating user last_login:", updateError);
          return { error: updateError };
        }
        
        return { data: existingUser, error: null };
      }
      
      // Insert new user
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            id: userId, 
            email, 
            username,
            password: '**********', // We don't store actual password in custom table
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          }
        ]);
      
      if (error) {
        console.error("Error saving user to custom table:", error);
        return { error };
      }
      
      console.log("User saved to custom table:", data);
      return { data, error: null };
    } catch (error) {
      console.error("Exception saving user to custom table:", error);
      return { data: null, error };
    }
  };

  // Helper function to create or update leaderboard entry for user
  const updateLeaderboardForUser = async (userId: string) => {
    try {
      // Check if user already has a leaderboard entry
      const { data: existingEntry, error: checkError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking for existing leaderboard entry:", checkError);
        return { error: checkError };
      }
      
      if (existingEntry) {
        console.log("User already has leaderboard entry");
        return { data: existingEntry, error: null };
      }
      
      // Create new leaderboard entry
      const { data, error } = await supabase
        .from('leaderboard')
        .insert([
          { 
            user_id: userId,
            score: 0,
            games_won: 0,
            rank: 0
          }
        ]);
      
      if (error) {
        console.error("Error creating leaderboard entry:", error);
        return { error };
      }
      
      console.log("Leaderboard entry created:", data);
      return { data, error: null };
    } catch (error) {
      console.error("Exception updating leaderboard:", error);
      return { data: null, error };
    }
  };

  return {
    user,
    session,
    loading,
    signIn: async (email: string, password: string) => {
      try {
        console.log(`Attempting to sign in user with email: ${email}`);
        setLoading(true);
        
        // Try to sign in with password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Login error:", error.message);
          
          // If the error is about email confirmation, we can try to resend the confirmation email
          if (error.message?.includes("Email not confirmed")) {
            // Optionally resend confirmation email
            await supabase.auth.resend({
              type: 'signup',
              email: email,
            });
            console.log("Resent confirmation email");
          }
          
          setLoading(false);
          return { data: null, error };
        }
        
        console.log("Sign in successful:", data);
        
        // Update last_login in custom users table
        if (data.user) {
          await saveUserToCustomTable(
            data.user.id, 
            data.user.email || email,
            data.user.user_metadata?.username || email.split('@')[0]
          );
        }
        
        toast.success("Login successful!");
        return { data, error: null };
      } catch (error: any) {
        console.error("Login error:", error.message);
        setLoading(false);
        return { data: null, error };
      }
    },
    signUp: async (username: string, email: string, password: string) => {
      try {
        console.log(`Attempting to sign up user with username: ${username} and email: ${email}`);
        setLoading(true);
        
        // First, sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: window.location.origin + '/auth',
          },
        });
        
        if (error) {
          console.error("Signup error:", error.message);
          toast.error(error.message || "Registration failed");
          setLoading(false);
          throw error;
        }
        
        console.log("Sign up successful:", data);
        
        // Save user data to custom users table
        if (data.user) {
          await saveUserToCustomTable(data.user.id, email, username);
          // Also create a leaderboard entry for the new user
          await updateLeaderboardForUser(data.user.id);
        }
        
        return { data, error: null };
      } catch (error: any) {
        console.error("Signup error:", error.message);
        setLoading(false);
        return { data: null, error };
      }
    },
    signOut: async () => {
      try {
        console.log("Attempting to sign out");
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }
  };
}
