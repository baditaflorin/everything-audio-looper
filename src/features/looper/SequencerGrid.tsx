import type { Pattern } from '../audio/types';

type Props = {
  pattern: Pattern;
  labels: string[];
  activeStep: number;
  onToggle: (pad: number, step: number) => void;
};

export function SequencerGrid({ pattern, labels, activeStep, onToggle }: Props) {
  if (pattern.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="sequencer-heading" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 id="sequencer-heading" className="text-lg font-semibold text-slate-100">
          16-step loop
        </h2>
        <span className="font-mono text-xs text-slate-400">4/4 quantized</span>
      </div>

      <div className="overflow-x-auto rounded-md border border-line bg-panel p-3">
        <div
          className="grid min-w-[720px] gap-2"
          style={{ gridTemplateColumns: '96px repeat(16, 1fr)' }}
        >
          <div />
          {Array.from({ length: 16 }).map((_, step) => (
            <div
              key={step}
              className={`text-center font-mono text-xs ${activeStep === step ? 'text-amber' : 'text-slate-500'}`}
            >
              {step + 1}
            </div>
          ))}

          {pattern.map((row, pad) => (
            <Row
              key={pad}
              activeStep={activeStep}
              label={labels[pad] ?? `Pad ${pad + 1}`}
              onToggle={onToggle}
              pad={pad}
              row={row}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type RowProps = {
  row: boolean[];
  pad: number;
  label: string;
  activeStep: number;
  onToggle: (pad: number, step: number) => void;
};

function Row({ row, pad, label, activeStep, onToggle }: RowProps) {
  return (
    <>
      <div className="flex h-9 items-center truncate pr-2 text-sm text-slate-300">{label}</div>
      {row.map((active, step) => (
        <button
          key={step}
          aria-label={`${label} step ${step + 1}`}
          aria-pressed={active}
          className={`h-9 rounded-sm border transition ${
            active
              ? 'border-mint bg-mint text-ink'
              : activeStep === step
                ? 'border-amber bg-amber/20'
                : 'border-line bg-ink hover:border-sky'
          }`}
          onClick={() => onToggle(pad, step)}
          title={`${label} step ${step + 1}`}
          type="button"
        />
      ))}
    </>
  );
}
