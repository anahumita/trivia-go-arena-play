
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

  return {
    user,
    session,
    loading,
    signIn: async (email: string, password: string) => {
      try {
        console.log(`Attempting to sign in user with email: ${email}`);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Login error:", error.message);
          toast.error(error.message || "Login failed");
          throw error;
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
        return { data: null, error };
      }
    },
    signUp: async (username: string, email: string, password: string) => {
      try {
        console.log(`Attempting to sign up user with username: ${username} and email: ${email}`);
        
        // First, sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
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
        
        // Save user data to custom users table
        if (data.user) {
          await saveUserToCustomTable(data.user.id, email, username);
        }
        
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
