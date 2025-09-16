import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

export const signIn = async (email: string, password: string) => {
  // First, try to authenticate with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (authError) {
    // If Supabase Auth fails, try custom admin authentication
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, active')
      .eq('email', email)
      .eq('password_hash', `crypt('${password}', password_hash)`)
      .eq('active', true)
      .single();

    if (adminError || !adminUser) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    // Create a session token (you might want to implement JWT here)
    localStorage.setItem('admin_user', JSON.stringify(adminUser));
    
    return { user: adminUser };
  }
  
  return authData;
};

export const signOut = async () => {
  // Clear admin session
  localStorage.removeItem('admin_user');
  
  // Sign out from Supabase Auth
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  // Check for admin user in localStorage first
  const adminUserStr = localStorage.getItem('admin_user');
  if (adminUserStr) {
    try {
      const adminUser = JSON.parse(adminUserStr);
      // Verify the admin user is still active
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name, role, active')
        .eq('id', adminUser.id)
        .eq('active', true)
        .single();
      
      if (!error && data) {
        return {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role
        };
      } else {
        localStorage.removeItem('admin_user');
      }
    } catch (e) {
      localStorage.removeItem('admin_user');
    }
  }

  // Check Supabase Auth user
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { 
    id: user.id, 
    email: user.email || '',
    full_name: user.user_metadata?.full_name 
  } : null;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  // Listen for admin user changes
  const checkAdminUser = () => {
    getCurrentUser().then(callback);
  };

  // Check immediately
  checkAdminUser();

  // Listen for Supabase auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ? { 
      id: session.user.id, 
      email: session.user.email || '',
      full_name: session.user.user_metadata?.full_name 
    } : null;
    callback(user);
  });

  return { data: { subscription } };
};

// Admin-specific functions
export const createAdminUser = async (userData: {
  email: string;
  password: string;
  full_name: string;
  role?: 'super_admin' | 'admin' | 'moderator';
}) => {
  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      email: userData.email,
      password_hash: `crypt('${userData.password}', gen_salt('bf'))`,
      full_name: userData.full_name,
      role: userData.role || 'admin'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAdminUser = async (id: string, updates: {
  email?: string;
  full_name?: string;
  role?: 'super_admin' | 'admin' | 'moderator';
  active?: boolean;
}) => {
  const { data, error } = await supabase
    .from('admin_users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const changeAdminPassword = async (id: string, newPassword: string) => {
  const { data, error } = await supabase
    .from('admin_users')
    .update({
      password_hash: `crypt('${newPassword}', gen_salt('bf'))`
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};