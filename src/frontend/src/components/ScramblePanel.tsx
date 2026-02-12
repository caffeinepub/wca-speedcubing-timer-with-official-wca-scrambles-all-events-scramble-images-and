import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface ScramblePanelProps {
  scramble: string;
  isGenerating: boolean;
  onNewScramble: () => void;
  disabled?: boolean;
}

export function ScramblePanel({ scramble, isGenerating, onNewScramble, disabled }: ScramblePanelProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">Scramble</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewScramble}
          disabled={disabled || isGenerating}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="min-h-[100px] flex items-center">
          {isGenerating ? (
            <p className="text-muted-foreground text-sm">Generating scramble...</p>
          ) : (
            <p className="text-lg font-mono leading-relaxed select-text break-words">
              {scramble || 'No scramble available'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
