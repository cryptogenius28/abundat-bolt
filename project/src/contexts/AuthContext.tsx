import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  createdAt: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

interface AuthState {
  user: User | null;
  addresses: Address[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'isDefault'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => Address | undefined;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const ADDRESSES_STORAGE_KEY = 'abundant-merch-addresses';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    addresses: [],
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
  });

  // Load addresses from localStorage
  useEffect(() => {
    try {
      const storedAddresses = localStorage.getItem(ADDRESSES_STORAGE_KEY);
      const addresses = storedAddresses ? JSON.parse(storedAddresses) : [];
      setState((prev) => ({ ...prev, addresses }));
    } catch {
      // Ignore errors
    }
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
        }));
      }
    });

    // Check for existing session
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }

  async function loadUserProfile(userId: string, email: string) {
    try {
      // Try to get existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile exists, check if this is the first user
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const isFirstUser = !count || count === 0;
        const role = isFirstUser ? 'admin' : 'customer';

        // Create profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              email,
              full_name: email.split('@')[0],
              role,
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        setUserFromProfile(newProfile, role === 'admin');
      } else if (profile) {
        setUserFromProfile(profile, profile.role === 'admin' || profile.role === 'staff');
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }

  function setUserFromProfile(profile: { id: string; email: string; full_name: string | null; role: string }, isAdmin: boolean) {
    const names = (profile.full_name || profile.email).split(' ');
    const user: User = {
      id: profile.id,
      email: profile.email,
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      role: profile.role as User['role'],
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: true,
      isAdmin,
      isLoading: false,
    }));
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user.id, data.user.email || '');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (
    userData: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: `${userData.firstName} ${userData.lastName}`,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Profile will be created by loadUserProfile
        // It will auto-detect if this is the first user
        await loadUserProfile(data.user.id, data.user.email || '');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(ADDRESSES_STORAGE_KEY);
    setState((prev) => ({
      ...prev,
      user: null,
      addresses: [],
      isAuthenticated: false,
      isAdmin: false,
    }));
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!state.user) return;

    const updates: { full_name?: string } = {};
    if (data.firstName || data.lastName) {
      updates.full_name = `${data.firstName || state.user.firstName} ${data.lastName || state.user.lastName}`.trim();
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);
    }

    setState((prev) => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...data };
      return { ...prev, user: updatedUser };
    });
  };

  const addAddress = (address: Omit<Address, 'id' | 'isDefault'>) => {
    setState((prev) => {
      const newAddress: Address = {
        ...address,
        id: `addr-${Date.now()}`,
        isDefault: prev.addresses.length === 0,
      };
      const addresses = [...prev.addresses, newAddress];
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
      return { ...prev, addresses };
    });
  };

  const updateAddress = (id: string, data: Partial<Address>) => {
    setState((prev) => {
      const addresses = prev.addresses.map((addr) =>
        addr.id === id ? { ...addr, ...data } : addr
      );
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
      return { ...prev, addresses };
    });
  };

  const deleteAddress = (id: string) => {
    setState((prev) => {
      let addresses = prev.addresses.filter((addr) => addr.id !== id);
      if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
        addresses = addresses.map((a, i) => ({ ...a, isDefault: i === 0 }));
      }
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
      return { ...prev, addresses };
    });
  };

  const setDefaultAddress = (id: string) => {
    setState((prev) => {
      const addresses = prev.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }));
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
      return { ...prev, addresses };
    });
  };

  const getDefaultAddress = () => {
    return state.addresses.find((addr) => addr.isDefault);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        getDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
