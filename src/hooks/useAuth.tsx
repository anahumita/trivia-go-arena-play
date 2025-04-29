
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
    signIn: async (email: string, password: string) => {
      try {
        console.log(`Attempting to sign in user: ${email}`);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Login error:", error.message);
          throw error;
        }
        
        console.log("Sign in successful:", data);
        return { data, error: null };
      } catch (error: any) {
        console.error("Login error:", error.message);
        return { data: null, error };
      }
    },
    signUp: async (email: string, password: string, username: string) => {
      try {
        console.log(`Attempting to sign up user: ${email} with username: ${username}`);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });
        
        if (error) {
          console.error("Signup error:", error.message);
          throw error;
        }
        
        console.log("Sign up successful:", data);
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
          throw error;
        }
        console.log("Sign out successful");
        return { error: null };
      } catch (error: any) {
        console.error("Logout error:", error.message);
        return { error };
      }
    }
  };
}
