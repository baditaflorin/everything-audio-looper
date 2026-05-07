import { Play } from 'lucide-react';
import { useEffect } from 'react';
import type { AudioSlice } from '../audio/types';

const KEYS = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Z', 'X', 'C', 'V', '1', '2', '3', '4'];

type Props = {
  slices: AudioSlice[];
  onTrigger: (index: number) => void;
};

export function PadGrid({ slices, onTrigger }: Props) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const index = KEYS.findIndex((key) => key.toLowerCase() === event.key.toLowerCase());
      if (index >= 0 && slices[index]) {
        event.preventDefault();
        onTrigger(index);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTrigger, slices]);

  return (
    <section aria-labelledby="pads-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="pads-heading" className="text-lg font-semibold text-slate-100">
          Drum kit
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: 16 }).map((_, index) => {
          const slice = slices[index];
          return (
            <button
              key={slice?.id ?? index}
              className="group grid aspect-square min-h-24 place-items-center rounded-md border border-line bg-panel p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!slice}
              onClick={() => onTrigger(index)}
              title={slice ? `Play ${slice.label}` : 'Empty pad'}
              type="button"
            >
              <span className="flex h-full w-full flex-col justify-between">
                <span className="flex items-center justify-between">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: slice?.color ?? '#2b3448' }}
                  />
                  <span className="rounded-sm bg-ink px-1.5 py-0.5 font-mono text-xs text-slate-400">
                    {KEYS[index]}
                  </span>
                </span>
                <span>
                  <span className="block truncate text-sm font-semibold text-slate-100">
                    {slice?.label ?? 'Empty'}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs uppercase tracking-normal text-slate-500">
                    <Play className="h-3 w-3" aria-hidden="true" />
                    {slice?.role ?? 'slot'}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
