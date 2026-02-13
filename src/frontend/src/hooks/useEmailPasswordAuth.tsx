import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useActor } from './useActor';
import type { backendInterface, AuthenticatedPrincipal } from '../backend';

interface User {
  userId: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoringSession: boolean;
  error: string | null;
}

interface AuthActions {
  signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TOKEN_KEY = 'wca-timer-session-token';

interface EmailPasswordAuthProviderProps {
  children: ReactNode;
}

function extractEmailFromPrincipal(principal: AuthenticatedPrincipal): string {
  if (principal.__kind__ === 'emailPassword') {
    return principal.emailPassword;
  }
  return 'unknown';
}

export function EmailPasswordAuthProvider({ children }: EmailPasswordAuthProviderProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (!actor || actorFetching) return;

      const token = localStorage.getItem(SESSION_TOKEN_KEY);
      if (!token) {
        setIsRestoringSession(false);
        return;
      }

      try {
        const typedActor = actor as backendInterface;
        const result = await typedActor.validateSession(token);
        
        if (result.isValid && result.user) {
          const email = extractEmailFromPrincipal(result.user);
          setUser({
            userId: email,
            email,
          });
        } else {
          // Token invalid or expired
          localStorage.removeItem(SESSION_TOKEN_KEY);
          setUser(null);
        }
      } catch (err: any) {
        console.error('Session restoration failed:', err);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        setUser(null);
      } finally {
        setIsRestoringSession(false);
      }
    };

    restoreSession();
  }, [actor, actorFetching]);

  const signup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!actor) {
      return { success: false, error: 'System not ready. Please try again.' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const typedActor = actor as backendInterface;
      const result = await typedActor.signup(email, password);
      
      if (result.__kind__ === 'success') {
        const { sessionToken, user: authUser } = result.success;
        const userEmail = extractEmailFromPrincipal(authUser);
        localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
        setUser({ userId: userEmail, email: userEmail });
        return { success: true };
      } else {
        const errorMsg = result.failure.message || 'Signup failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred during signup';
      console.error('Signup error:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!actor) {
      return { success: false, error: 'System not ready. Please try again.' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const typedActor = actor as backendInterface;
      const result = await typedActor.login(email, password);
      
      if (result.__kind__ === 'success') {
        const { sessionToken, user: authUser } = result.success;
        const userEmail = extractEmailFromPrincipal(authUser);
        localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
        setUser({ userId: userEmail, email: userEmail });
        return { success: true };
      } else {
        const errorMsg = result.failure.message || 'Invalid email or password';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred during login';
      console.error('Login error:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    
    if (token && actor) {
      try {
        const typedActor = actor as backendInterface;
        await typedActor.logout(token);
      } catch (err) {
        console.error('Logout error:', err);
        // Continue with local cleanup even if backend call fails
      }
    }

    localStorage.removeItem(SESSION_TOKEN_KEY);
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isRestoringSession,
    error,
    signup,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useEmailPasswordAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useEmailPasswordAuth must be used within EmailPasswordAuthProvider');
  }
  return context;
}
