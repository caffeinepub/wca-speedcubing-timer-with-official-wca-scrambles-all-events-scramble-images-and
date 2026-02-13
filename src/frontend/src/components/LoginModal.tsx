import { useState, useEffect } from 'react';
import { useEmailPasswordAuth } from '../hooks/useEmailPasswordAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: () => void;
}

export function LoginModal({ open, onOpenChange, onAuthSuccess }: LoginModalProps) {
  const { signup, login, isLoading, isAuthenticated, error, clearError } = useEmailPasswordAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  // Close modal on successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      onOpenChange(false);
      onAuthSuccess?.();
    }
  }, [isAuthenticated, onOpenChange, onAuthSuccess]);

  // Clear errors when switching modes or closing
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setValidationError('');
      clearError();
    }
  }, [open, clearError]);

  useEffect(() => {
    setValidationError('');
    clearError();
  }, [mode, clearError]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    setValidationError('');

    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }

    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setValidationError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return false;
    }

    if (mode === 'signup') {
      if (!confirmPassword) {
        setValidationError('Please confirm your password');
        return false;
      }

      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (mode === 'signup') {
      const result = await signup(email.trim(), password);
      if (!result.success && result.error) {
        setValidationError(result.error);
      }
    } else {
      const result = await login(email.trim(), password);
      if (!result.success && result.error) {
        setValidationError(result.error);
      }
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setValidationError('');
    clearError();
  };

  const displayError = validationError || error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {mode === 'login'
              ? 'Sign in to save your solves and track your progress'
              : 'Sign up to start tracking your cubing journey'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="new-password"
              />
            </div>
          )}

          <Button type="submit" disabled={isLoading} size="lg" className="w-full">
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {mode === 'login' ? (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up
                  </>
                )}
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              disabled={isLoading}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {mode === 'login' ? (
                <>
                  Don't have an account? <span className="font-medium">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="font-medium">Sign in</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            You can continue without signing in, but your data will only be saved locally.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
