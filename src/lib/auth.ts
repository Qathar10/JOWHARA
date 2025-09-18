import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

export const signIn = async (email: string, password: string) => {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (authError) {
    throw new Error('Invalid email or password');
  }
  
  return authData;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name,
    role: user.app_metadata?.role
  };
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ? {
      id: session.user.id,
      email: session.user.email || '',
      full_name: session.user.user_metadata?.full_name,
      role: session.user.app_metadata?.role
    } : null;
    callback(user);
  });

  return { data: { subscription } };
};

// Helper function to check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

// Helper function to check if user has admin access
export const hasAdminAccess = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return isAdmin(user);
};