import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: () => void;
}

export function LoginModal({ open, onOpenChange, onAuthSuccess }: LoginModalProps) {
  const { login, isLoggingIn, isLoginSuccess, identity } = useInternetIdentity();

  // Check if user is authenticated (non-anonymous identity)
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  // Close modal and trigger callback on successful authentication
  useEffect(() => {
    if (isLoginSuccess && isAuthenticated) {
      onOpenChange(false);
      onAuthSuccess?.();
    }
  }, [isLoginSuccess, isAuthenticated, onOpenChange, onAuthSuccess]);

  const handleSignIn = () => {
    login();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome to WCA Timer</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Sign in with Internet Identity to save your solves and track your progress across devices.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleSignIn}
            disabled={isLoggingIn}
            size="lg"
            className="w-full"
          >
            {isLoggingIn ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Sign in with Internet Identity
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            You can continue without signing in, but your data will only be saved locally.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
