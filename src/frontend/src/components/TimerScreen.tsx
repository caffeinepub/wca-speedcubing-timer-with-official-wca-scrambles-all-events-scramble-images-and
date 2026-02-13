import { useState, useEffect } from 'react';
import { EventSelector } from './EventSelector';
import { ScramblePanel } from './ScramblePanel';
import { ScrambleVisualizer } from './ScrambleVisualizer';
import { TimerDisplay } from './TimerDisplay';
import { SolveHistory } from './SolveHistory';
import { SessionStats } from './SessionStats';
import { LoginModal } from './LoginModal';
import { useWcaScramble } from '../hooks/useWcaScramble';
import { useWcaTimerControls } from '../hooks/useWcaTimerControls';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { SolveEntry } from '../types/solves';
import { computeSessionStats } from '../lib/sessionStats';
import { saveSessionData, loadSessionData } from '../lib/sessionCookie';
import { SiGithub } from 'react-icons/si';
import { Heart, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FIRST_VISIT_KEY = 'wca-timer-first-visit-seen';

export function TimerScreen() {
  const [selectedEvent, setSelectedEvent] = useState('333');
  const [solves, setSolves] = useState<SolveEntry[]>([]);
  const [initialScramble, setInitialScramble] = useState<string | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  // Load session data on mount
  useEffect(() => {
    const savedData = loadSessionData();
    if (savedData) {
      setSelectedEvent(savedData.event);
      setSolves(savedData.solves);
      setInitialScramble(savedData.scramble);
    }
    setIsInitialized(true);
  }, []);

  // Auto-open login modal on first visit for unauthenticated users
  useEffect(() => {
    // Wait for auth initialization to complete
    if (isInitializing) return;

    // Check if user is authenticated
    if (isAuthenticated) return;

    // Check if first-visit modal has been shown before
    const hasSeenModal = localStorage.getItem(FIRST_VISIT_KEY);
    if (!hasSeenModal) {
      setLoginModalOpen(true);
    }
  }, [isInitializing, isAuthenticated]);

  // Handle modal close or successful auth
  const handleModalClose = (open: boolean) => {
    setLoginModalOpen(open);
    if (!open) {
      // Mark as seen when modal is dismissed
      localStorage.setItem(FIRST_VISIT_KEY, 'true');
    }
  };

  const handleAuthSuccess = () => {
    // Mark as seen on successful authentication
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
  };

  const { scramble, isGenerating, generateScramble, setScramble } = useWcaScramble(
    selectedEvent,
    initialScramble
  );
  const timerControls = useWcaTimerControls();

  // Save session data whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveSessionData({
        event: selectedEvent,
        scramble,
        solves,
      });
    }
  }, [selectedEvent, scramble, solves, isInitialized]);

  // Auto-generate new scramble after solve stops
  useEffect(() => {
    if (timerControls.state === 'stopped' && timerControls.finalResult) {
      // Add solve to history
      const newSolve: SolveEntry = {
        id: `${Date.now()}-${Math.random()}`,
        time: timerControls.finalResult.time,
        event: selectedEvent,
        scramble: scramble,
        timestamp: Date.now(),
        inspectionOutcome: timerControls.finalResult.inspectionOutcome,
      };
      
      setSolves(prev => [...prev, newSolve]);
      
      // Generate new scramble after a brief delay
      setTimeout(() => {
        generateScramble();
      }, 100);
    }
  }, [timerControls.state, timerControls.finalResult]);

  const handleNewScramble = () => {
    if (!timerControls.isRunning) {
      timerControls.reset();
      generateScramble();
    }
  };

  const handleEventChange = (eventId: string) => {
    if (!timerControls.isRunning) {
      setSelectedEvent(eventId);
      timerControls.reset();
    }
  };

  const stats = computeSessionStats(solves);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-timer-primary to-timer-secondary flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">WCA Timer</h1>
              <p className="text-xs text-muted-foreground">Official Scrambles</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLoginModalOpen(true)}
                aria-label="Sign in"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogIn className="w-5 h-5" />
              </Button>
            )}
            <a
              href="https://github.com/cubing/cubing.js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <SiGithub className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        open={loginModalOpen}
        onOpenChange={handleModalClose}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Event Selector */}
        <div className="flex justify-center">
          <EventSelector
            selectedEvent={selectedEvent}
            onEventChange={handleEventChange}
            disabled={timerControls.isRunning}
          />
        </div>

        {/* Scramble Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ScramblePanel
            scramble={scramble}
            isGenerating={isGenerating}
            onNewScramble={handleNewScramble}
            disabled={timerControls.isRunning}
          />
          <ScrambleVisualizer scramble={scramble} eventId={selectedEvent} />
        </div>

        {/* Timer Display */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <TimerDisplay {...timerControls} />
        </div>

        {/* Session Stats */}
        <SessionStats stats={stats} />

        {/* Solve History */}
        <SolveHistory solves={solves} />

        {/* Instructions */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-3 text-center">How to Use</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-timer-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">⌨️</span>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Desktop</p>
                <p className="text-xs">Hold <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd> to start inspection (15s). Hold again to arm, release to start solve. Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd> to stop.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-timer-secondary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📱</span>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Mobile</p>
                <p className="text-xs">Press and hold to start inspection. Hold again to arm, release to start solve. Tap to stop.</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/40">
            <p className="text-xs text-center text-muted-foreground">
              <strong>Inspection Rules:</strong> 15 seconds to inspect. Warnings at 8s and 5s. Start within +2s after 0 for +2 penalty. After +2s = DNF.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with <Heart className="inline w-4 h-4 text-destructive fill-destructive" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'wca-timer')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1 text-xs">© {new Date().getFullYear()} WCA Timer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
