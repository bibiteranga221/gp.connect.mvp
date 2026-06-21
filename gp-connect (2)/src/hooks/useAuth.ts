import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface AuthProfile {
  id: string;
  email?: string;
  role?: string;
  nom?: string;
  prenom?: string;
}

export function useAuth(requiredRole?: 'CLIENT' | 'GP' | 'ADMIN', redirectTo: string = '/auth/connexion') {
  const [user, setUser] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkUserSession() {
      // 1. If Supabase is not configured, fall back to offline simulation
      if (!supabase) {
        const cachedUser = localStorage.getItem('gpc_current_user');
        const cachedRole = localStorage.getItem('user_role');
        const token = localStorage.getItem('user_id');

        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser);
            const userProfile: AuthProfile = {
              id: parsed.id || 'fictif-uid-123',
              email: parsed.email || 'user@example.com',
              role: (parsed.role || cachedRole || 'CLIENT').toUpperCase(),
              nom: parsed.nom || '',
              prenom: parsed.prenom || '',
            };

            if (isMounted) {
              setUser(userProfile);
              setLoading(false);
              
              // Validate role
              if (requiredRole && userProfile.role !== requiredRole && userProfile.role !== 'ADMIN') {
                handleRedirect();
              }
            }
            return;
          } catch {
            // parsing error fallback
          }
        }

        // If no user found and required, trigger redirect
        if (requiredRole && isMounted) {
          handleRedirect();
        }
        if (isMounted) setLoading(false);
        return;
      }

      // 2. If Supabase is configured, use authentic database session checks
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          if (isMounted) {
            setUser(null);
            setLoading(false);
            handleRedirect();
          }
          return;
        }

        const { data: userProfile, error } = await supabase
          .from('users')
          .select('id, email, role, nom, prenom')
          .eq('id', session.user.id)
          .single();

        if (isMounted) {
          if (!error && userProfile) {
            const mappedUser: AuthProfile = {
              id: userProfile.id,
              email: userProfile.email || session.user.email,
              role: (userProfile.role || 'CLIENT').toUpperCase(),
              nom: userProfile.nom || '',
              prenom: userProfile.prenom || '',
            };

            if (requiredRole && mappedUser.role !== requiredRole && mappedUser.role !== 'ADMIN') {
              handleRedirect();
              return;
            }

            setUser(mappedUser);
          } else {
            // User connected to Supabase auth but profile retrieval skipped/failed
            setUser({ id: session.user.id, email: session.user.email });
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error verifying Supabase user session:', err);
        if (isMounted) setLoading(false);
      }
    }

    function handleRedirect() {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        // Do not redirect if we are already on a public or authentication page
        if (path !== redirectTo && !path.includes('/auth') && path !== '/') {
          console.warn(`[useAuth] Guard activated. Redirecting to ${redirectTo}`);
          window.location.href = redirectTo;
        }
      }
    }

    checkUserSession();

    // Setup Supabase auth trigger listener
    const authListener = supabase?.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
          handleRedirect();
        }
      } else if (session?.user) {
        checkUserSession();
      }
    });

    return () => {
      isMounted = false;
      authListener?.data.subscription.unsubscribe();
    };
  }, [requiredRole, redirectTo]);

  return { user, loading, supabase };
}
