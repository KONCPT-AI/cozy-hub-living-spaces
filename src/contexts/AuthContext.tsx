
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'professional' | 'admin';
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData: { name: string; userType: 'student' | 'professional' }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile from profiles table
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching profile:', error);
                // Create profile if it doesn't exist
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    user_id: session.user.id,
                    email: session.user.email || '',
                    full_name: session.user.user_metadata?.full_name || '',
                    user_type: session.user.user_metadata?.user_type || 'student'
                  });
                
                if (insertError) {
                  console.error('Error creating profile:', insertError);
                }
              }

              // Check if user is admin - first by user_id, then by email for demo users
              let { data: adminUser } = await supabase
                .from('admin_users')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .single();

              // If not found by user_id, check by email (for demo admin)
              if (!adminUser) {
                const { data: adminByEmail } = await supabase
                  .from('admin_users')
                  .select('*')
                  .eq('email', session.user.email)
                  .eq('is_active', true)
                  .single();
                
                adminUser = adminByEmail;
              }

              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile?.full_name || session.user.user_metadata?.full_name || 'User',
                userType: adminUser ? 'admin' : (profile?.user_type || 'student'),
                isVerified: session.user.email_confirmed_at ? true : false
              });
            } catch (error) {
              console.error('Error in auth state change:', error);
            }
          }, 0);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      // The onAuthStateChange will handle setting the user
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Special handling for demo admin
      if (email === 'admin@demo.com' && password === 'admin123') {
        console.log('Demo admin login attempt');
        
        // Check if demo admin exists in admin_users table
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', 'admin@demo.com')
          .eq('is_active', true)
          .single();

        if (adminError || !adminUser) {
          console.error('Demo admin not found in database:', adminError);
          setIsLoading(false);
          return false;
        }

        // Create a mock session for demo admin
        const mockUser: User = {
          id: '00000000-0000-0000-0000-000000000001', // Use the special UUID
          email: adminUser.email,
          name: adminUser.full_name || 'Demo Admin',
          userType: 'admin',
          isVerified: true
        };

        setUser(mockUser);
        setIsLoading(false);
        return true;
      }

      // Regular authentication for other users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Auth error:', error);
        setIsLoading(false);
        return false;
      }

      // User state will be set by the auth state change listener
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    userData: { name: string; userType: 'student' | 'professional' }
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: userData.name,
            user_type: userData.userType
          }
        }
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    // If it's the demo admin (mock session), just clear the state
    if (user?.email === 'admin@demo.com') {
      setUser(null);
      setSession(null);
      return;
    }

    // Regular logout for Supabase authenticated users
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
