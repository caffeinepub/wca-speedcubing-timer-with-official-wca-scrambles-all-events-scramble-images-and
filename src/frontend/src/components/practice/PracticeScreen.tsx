import { useState } from 'react';
import { PracticeBrowseCompetitions } from './PracticeBrowseCompetitions';
import { PracticeSelectEvent } from './PracticeSelectEvent';
import { PracticeReady } from './PracticeReady';
import { usePracticeSessionPersistence } from '../../hooks/usePracticeSessionPersistence';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface PracticeScreenProps {
  onBack: () => void;
}

type PracticeStep = 'browse' | 'select-event' | 'ready';

export function PracticeScreen({ onBack }: PracticeScreenProps) {
  const { state, save, clear } = usePracticeSessionPersistence();
  const [step, setStep] = useState<PracticeStep>(() => {
    if (state.competitionId && state.eventId && state.scrambles.length > 0) {
      return 'ready';
    } else if (state.competitionId) {
      return 'select-event';
    }
    return 'browse';
  });

  const handleCompetitionSelect = (competitionId: string, competitionName: string) => {
    save({ competitionId, competitionName, eventId: null, scrambles: [], currentIndex: 0 });
    setStep('select-event');
  };

  const handleEventSelect = (eventId: string) => {
    save({ eventId });
    setStep('ready');
  };

  const handleBackToBrowse = () => {
    save({ competitionId: null, competitionName: null, eventId: null, scrambles: [], currentIndex: 0 });
    setStep('browse');
  };

  const handleBackToEvents = () => {
    save({ eventId: null, scrambles: [], currentIndex: 0 });
    setStep('select-event');
  };

  const handleReset = () => {
    clear();
    setStep('browse');
  };

  return (
    <div className="practice-theme min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Timer</span>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-practice-primary to-practice-secondary flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Practice Mode</h1>
              <p className="text-xs text-muted-foreground">WCA Competition Simulation</p>
            </div>
          </div>
          {step !== 'browse' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Reset Session
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {step === 'browse' && (
          <PracticeBrowseCompetitions onSelect={handleCompetitionSelect} />
        )}
        {step === 'select-event' && state.competitionId && (
          <PracticeSelectEvent
            competitionId={state.competitionId}
            competitionName={state.competitionName || ''}
            onSelect={handleEventSelect}
            onBack={handleBackToBrowse}
          />
        )}
        {step === 'ready' && state.competitionId && state.eventId && (
          <PracticeReady
            competitionName={state.competitionName || ''}
            eventId={state.eventId}
            onBack={handleBackToEvents}
          />
        )}
      </main>
    </div>
  );
}
