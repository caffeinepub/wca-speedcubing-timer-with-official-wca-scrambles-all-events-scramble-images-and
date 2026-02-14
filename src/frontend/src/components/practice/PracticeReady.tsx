import { useEffect } from 'react';
import { usePracticeScrambles } from '../../hooks/usePracticeScrambles';
import { usePracticeSessionPersistence } from '../../hooks/usePracticeSessionPersistence';
import { WCA_EVENTS } from '../../lib/wcaEvents';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface PracticeReadyProps {
  competitionName: string;
  eventId: string;
  onBack: () => void;
}

export function PracticeReady({ competitionName, eventId, onBack }: PracticeReadyProps) {
  const { save, state } = usePracticeSessionPersistence();
  const {
    scrambles,
    currentScramble,
    currentIndex,
    totalCount,
    isGenerating,
    next,
    previous,
    regenerate,
    canGoNext,
    canGoPrevious,
  } = usePracticeScrambles(eventId, 5);

  const event = WCA_EVENTS.find(e => e.scrambleEvent === eventId);

  // Save scrambles to persistence when they change
  useEffect(() => {
    if (scrambles.length > 0) {
      save({ scrambles, currentIndex: 0 });
    }
  }, [scrambles]);

  // Update current index in persistence
  useEffect(() => {
    save({ currentIndex });
  }, [currentIndex]);

  const handleRegenerate = () => {
    regenerate();
  };

  if (isGenerating && scrambles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-practice-primary" />
          <p className="text-muted-foreground">Generating scrambles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button onClick={onBack} variant="ghost" className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Button>

      {/* Competition & Event Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{event?.name || eventId}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{competitionName}</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Scramble {currentIndex + 1}/{totalCount}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Scramble Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Scramble</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
            <p className="text-lg font-mono text-center leading-relaxed">
              {currentScramble || 'No scramble available'}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={previous}
              disabled={!canGoPrevious}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground min-w-[100px] text-center">
              {currentIndex + 1} of {totalCount}
            </span>
            <Button
              variant="outline"
              onClick={next}
              disabled={!canGoNext}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Complete all 5 scrambles to simulate a competition round</p>
          <p>• Use the navigation buttons to move between scrambles</p>
          <p>• Click "Regenerate All" to get a fresh set of 5 scrambles</p>
          <p>• Your progress is automatically saved in your browser</p>
        </CardContent>
      </Card>
    </div>
  );
}
