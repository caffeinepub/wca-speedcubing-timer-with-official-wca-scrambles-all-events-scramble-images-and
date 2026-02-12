import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScrambleVisualizerProps {
  scramble: string;
  eventId: string;
}

export function ScrambleVisualizer({ scramble, eventId }: ScrambleVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!scramble || !containerRef.current) return;

    setIsLoading(true);
    setError(null);

    let mounted = true;

    const loadVisualization = async () => {
      try {
        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Use CDN import for better compatibility
        const { TwistyPlayer } = await import('https://cdn.cubing.net/v0/js/cubing/twisty');

        if (!mounted || !containerRef.current) return;

        // Map event IDs to puzzle names for TwistyPlayer
        const puzzleMap: Record<string, string> = {
          '222': '2x2x2',
          '333': '3x3x3',
          '444': '4x4x4',
          '555': '5x5x5',
          '666': '6x6x6',
          '777': '7x7x7',
          '333bf': '3x3x3',
          '333fm': '3x3x3',
          '333oh': '3x3x3',
          'clock': 'clock',
          'minx': 'megaminx',
          'pyram': 'pyraminx',
          'skewb': 'skewb',
          'sq1': 'square1',
          '444bf': '4x4x4',
          '555bf': '5x5x5',
        };

        const puzzleName = puzzleMap[eventId] || '3x3x3';

        const player = new TwistyPlayer({
          puzzle: puzzleName,
          alg: scramble,
          hintFacelets: 'none',
          backView: 'none',
          controlPanel: 'none',
          background: 'none',
          visualization: '2D',
        });

        // Style the player
        player.style.width = '100%';
        player.style.height = '300px';

        containerRef.current.appendChild(player);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading visualization:', err);
        if (mounted) {
          setError('Visualization not available for this event');
          setIsLoading(false);
        }
      }
    };

    loadVisualization();

    return () => {
      mounted = false;
    };
  }, [scramble, eventId]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-h-[300px] flex items-center justify-center">
          {isLoading && !error && (
            <p className="text-muted-foreground text-sm">Loading visualization...</p>
          )}
          {error && (
            <p className="text-muted-foreground text-sm text-center">{error}</p>
          )}
          <div ref={containerRef} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
