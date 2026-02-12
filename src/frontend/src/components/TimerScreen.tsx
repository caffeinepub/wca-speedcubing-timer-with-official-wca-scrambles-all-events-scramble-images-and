import { useState } from 'react';
import { EventSelector } from './EventSelector';
import { ScramblePanel } from './ScramblePanel';
import { ScrambleVisualizer } from './ScrambleVisualizer';
import { TimerDisplay } from './TimerDisplay';
import { useWcaScramble } from '../hooks/useWcaScramble';
import { useWcaTimerControls } from '../hooks/useWcaTimerControls';
import { SiGithub } from 'react-icons/si';

export function TimerScreen() {
  const [selectedEvent, setSelectedEvent] = useState('333');
  const { scramble, isGenerating, generateScramble } = useWcaScramble(selectedEvent);
  const timerControls = useWcaTimerControls();

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
          <a
            href="https://github.com/cubing/cubing.js"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <SiGithub className="w-5 h-5" />
          </a>
        </div>
      </header>

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
                <p className="text-xs">Hold <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd> to arm, release to start. Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd> again to stop.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-timer-secondary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📱</span>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Mobile</p>
                <p className="text-xs">Press and hold the timer to arm, release to start. Tap to stop.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              caffeine.ai
            </a>
            {' • '}
            Powered by{' '}
            <a
              href="https://github.com/cubing/cubing.js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              cubing.js
            </a>
            {' • '}
            © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
