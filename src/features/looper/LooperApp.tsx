import { useQuery } from '@tanstack/react-query';
import {
  BadgeDollarSign,
  CircleStop,
  GitFork,
  HardDriveDownload,
  Loader2,
  Mic,
  Play,
  RotateCcw,
  Save,
  Sparkles
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { analyzeRecording } from '../audio/audioAnalysis';
import { createDemoKit } from '../audio/demoKit';
import { createTechnoPattern, toggleStep } from '../audio/loopPattern';
import { WebAudioEngine } from '../audio/webAudioEngine';
import type { AnalyzerMode, DrumKit, Pattern } from '../audio/types';
import { getAnalyzerMode, getLatestKit, saveAnalyzerMode, saveKit } from '../storage/kitStore';
import { AppError, toAppError } from '../../shared/errors';
import { buildVersion, fetchVersionManifest, paypalUrl, repositoryUrl } from '../../shared/version';
import { useRecorder } from './useRecorder';
import { PadGrid } from './PadGrid';
import { SequencerGrid } from './SequencerGrid';
import { WaveformCanvas } from './WaveformCanvas';

type Status = {
  kind: 'idle' | 'working' | 'success' | 'warning' | 'error';
  message: string;
};

export function LooperApp() {
  const recorder = useRecorder();
  const engine = useRef(new WebAudioEngine());
  const [kit, setKit] = useState<DrumKit | undefined>();
  const [pattern, setPattern] = useState<Pattern>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [analyzerMode, setAnalyzerMode] = useState<AnalyzerMode>('fast-js');
  const [status, setStatus] = useState<Status>({
    kind: 'idle',
    message: 'Record a short rhythm or load the demo kit.'
  });

  const versionQuery = useQuery({
    queryKey: ['version'],
    queryFn: () => fetchVersionManifest(),
    initialData: buildVersion
  });

  const latestKitQuery = useQuery({
    queryKey: ['latest-kit'],
    queryFn: getLatestKit
  });

  useEffect(() => {
    const audioEngine = engine.current;
    audioEngine.setStepCallback(setActiveStep);
    void getAnalyzerMode().then(setAnalyzerMode);
    return () => audioEngine.stop();
  }, []);

  const installKit = useCallback(async (nextKit: DrumKit, message: string) => {
    setKit(nextKit);
    const nextPattern = createTechnoPattern(nextKit.slices);
    setPattern(nextPattern);
    await engine.current.loadKit(nextKit);
    setStatus({ kind: 'success', message });
  }, []);

  async function handleDemo() {
    setStatus({ kind: 'working', message: 'Synthesizing a kitchen-table recording.' });
    const nextKit = createDemoKit();
    await installKit(
      nextKit,
      `Demo kit ready: ${nextKit.slices.length} pads at ${nextKit.bpm} BPM.`
    );
  }

  async function handleRecordClick() {
    if (!recorder.isRecording) {
      try {
        await recorder.start();
        setStatus({
          kind: 'working',
          message: 'Recording. Make claps, taps, clicks, or pen sounds.'
        });
      } catch (error) {
        showError(error, 'Microphone access failed.');
      }
      return;
    }

    try {
      const recorded = await recorder.stop();
      setStatus({ kind: 'working', message: 'Finding BPM, transients, and playable chops.' });
      const analysis = await analyzeRecording(recorded.samples, recorded.sampleRate, analyzerMode);
      const nextKit: DrumKit = {
        id: crypto.randomUUID(),
        name: `Recorded kit ${new Date().toLocaleTimeString()}`,
        source: 'recording',
        analyzer: analysis.analyzer,
        createdAt: new Date().toISOString(),
        sampleRate: recorded.sampleRate,
        duration: recorded.duration,
        bpm: analysis.bpm,
        onsets: analysis.onsets,
        slices: analysis.slices,
        sourceSamples: recorded.samples
      };
      await installKit(
        nextKit,
        analysis.warning ??
          `Recording chopped into ${nextKit.slices.length} pads at ${nextKit.bpm} BPM.`
      );

      if (analysis.warning) {
        setStatus({ kind: 'warning', message: analysis.warning });
      }
    } catch (error) {
      showError(error, 'Recording analysis failed.');
    }
  }

  async function handleSave() {
    if (!kit) return;

    try {
      await saveKit(kit);
      await latestKitQuery.refetch();
      setStatus({ kind: 'success', message: 'Kit saved locally in this browser.' });
    } catch (error) {
      showError(error, 'Local save failed.');
    }
  }

  async function handleRestore() {
    const restored = latestKitQuery.data ?? (await getLatestKit());
    if (!restored) {
      setStatus({ kind: 'warning', message: 'No saved kit found in this browser yet.' });
      return;
    }

    await installKit({ ...restored, source: 'restored' }, 'Restored the last saved kit.');
  }

  async function handlePlayPad(index: number) {
    try {
      await engine.current.playPad(index);
    } catch (error) {
      showError(error, 'Pad playback failed.');
    }
  }

  async function handleTransport() {
    if (!kit || pattern.length === 0) return;

    try {
      if (isPlaying) {
        engine.current.stop();
        setIsPlaying(false);
        return;
      }

      await engine.current.start(pattern);
      setIsPlaying(true);
    } catch (error) {
      showError(error, 'Loop playback failed.');
    }
  }

  async function handleAnalyzerChange(mode: AnalyzerMode) {
    setAnalyzerMode(mode);
    await saveAnalyzerMode(mode);
  }

  function updateBpm(value: number) {
    if (!kit) return;
    const bpm = Math.min(180, Math.max(80, Math.round(value)));
    setKit({ ...kit, bpm });
    engine.current.setBpm(bpm);
  }

  function showError(error: unknown, fallbackMessage: string) {
    const appError = toAppError(
      error,
      new AppError(
        'analysis_failed',
        fallbackMessage,
        'Try the demo kit or make a shorter recording.'
      )
    );
    setStatus({ kind: 'error', message: `${appError.message} ${appError.recovery}` });
  }

  const manifest = versionQuery.data;
  const slices = useMemo(() => kit?.slices ?? [], [kit]);
  const firstEightLabels = useMemo(
    () => slices.slice(0, pattern.length).map((slice) => slice.label),
    [pattern.length, slices]
  );

  return (
    <main className="min-h-screen px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-normal text-mint">
              Everything Audio Looper
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
              Turn room sounds into a locked-in techno loop.
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky"
              href={repositoryUrl}
              rel="noreferrer"
              target="_blank"
            >
              <GitFork className="h-4 w-4" aria-hidden="true" />
              Star on GitHub
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber"
              href={paypalUrl}
              rel="noreferrer"
              target="_blank"
            >
              <BadgeDollarSign className="h-4 w-4" aria-hidden="true" />
              PayPal
            </a>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_360px]">
          <div className="space-y-5">
            <WaveformCanvas
              samples={kit?.sourceSamples}
              onsets={kit?.onsets ?? []}
              activeStep={activeStep}
            />

            <div className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-panel p-3">
              <button
                className={`inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2 font-semibold transition ${
                  recorder.isRecording ? 'bg-coral text-white' : 'bg-mint text-ink hover:bg-mint/90'
                }`}
                onClick={() => void handleRecordClick()}
                type="button"
              >
                {recorder.isRecording ? (
                  <CircleStop className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Mic className="h-5 w-5" aria-hidden="true" />
                )}
                {recorder.isRecording ? 'Stop and chop' : 'Record'}
              </button>

              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-ink px-4 py-2 font-semibold text-slate-100 transition hover:border-sky"
                onClick={() => void handleDemo()}
                type="button"
              >
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                Demo
              </button>

              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-ink px-4 py-2 font-semibold text-slate-100 transition hover:border-mint disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!kit}
                onClick={() => void handleTransport()}
                type="button"
              >
                {isPlaying ? <CircleStop className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {isPlaying ? 'Stop loop' : 'Play loop'}
              </button>

              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-ink px-4 py-2 font-semibold text-slate-100 transition hover:border-mint disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!kit}
                onClick={() => void handleSave()}
                type="button"
              >
                <Save className="h-5 w-5" aria-hidden="true" />
                Save
              </button>

              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-ink px-4 py-2 font-semibold text-slate-100 transition hover:border-sky"
                onClick={() => void handleRestore()}
                type="button"
              >
                <HardDriveDownload className="h-5 w-5" aria-hidden="true" />
                Restore
              </button>
            </div>

            <StatusPanel status={status} />
            <PadGrid slices={slices} onTrigger={(index) => void handlePlayPad(index)} />
            <SequencerGrid
              activeStep={activeStep}
              labels={firstEightLabels}
              onToggle={(pad, step) => setPattern((current) => toggleStep(current, pad, step))}
              pattern={pattern}
            />
          </div>

          <aside className="space-y-4">
            <section className="rounded-md border border-line bg-panel p-4">
              <h2 className="text-lg font-semibold">Analyzer</h2>
              <div className="mt-4 grid grid-cols-2 rounded-md border border-line bg-ink p-1">
                <button
                  aria-pressed={analyzerMode === 'fast-js'}
                  className={`rounded-sm px-3 py-2 text-sm font-semibold ${
                    analyzerMode === 'fast-js' ? 'bg-mint text-ink' : 'text-slate-300'
                  }`}
                  onClick={() => void handleAnalyzerChange('fast-js')}
                  type="button"
                >
                  Fast JS
                </button>
                <button
                  aria-pressed={analyzerMode === 'librosa-wasm'}
                  className={`rounded-sm px-3 py-2 text-sm font-semibold ${
                    analyzerMode === 'librosa-wasm' ? 'bg-mint text-ink' : 'text-slate-300'
                  }`}
                  onClick={() => void handleAnalyzerChange('librosa-wasm')}
                  type="button"
                >
                  Librosa WASM
                </button>
              </div>
            </section>

            <section className="rounded-md border border-line bg-panel p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tempo</h2>
                <span className="font-mono text-2xl text-amber">{kit?.bpm ?? 120}</span>
              </div>
              <input
                aria-label="Loop BPM"
                className="mt-4 w-full accent-mint"
                disabled={!kit}
                max={180}
                min={80}
                onChange={(event) => updateBpm(Number(event.target.value))}
                type="range"
                value={kit?.bpm ?? 120}
              />
              <div className="mt-2 flex justify-between font-mono text-xs text-slate-500">
                <span>80</span>
                <span>180</span>
              </div>
            </section>

            <section className="rounded-md border border-line bg-panel p-4">
              <h2 className="text-lg font-semibold">Session</h2>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Metric label="Pads" value={String(slices.length)} />
                <Metric label="Onsets" value={String(kit?.onsets.length ?? 0)} />
                <Metric label="Duration" value={kit ? `${kit.duration.toFixed(1)}s` : '0.0s'} />
                <Metric label="Engine" value={kit?.analyzer ?? analyzerMode} />
              </dl>
              <button
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-line bg-ink px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-coral disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!kit}
                onClick={() => {
                  setKit(undefined);
                  setPattern([]);
                  engine.current.stop();
                  setIsPlaying(false);
                  setStatus({
                    kind: 'idle',
                    message: 'Record a short rhythm or load the demo kit.'
                  });
                }}
                type="button"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear session
              </button>
            </section>

            <footer className="rounded-md border border-line bg-panel p-4 text-sm text-slate-400">
              <div className="flex items-center gap-2 text-slate-300">
                {versionQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span className="font-semibold text-slate-100">Version {manifest.version}</span>
              </div>
              <p className="mt-2 font-mono text-xs">Commit {manifest.commit}</p>
              <p className="mt-1 font-mono text-xs">
                Built {new Date(manifest.builtAt).toLocaleString()}
              </p>
              <p className="mt-3 break-words">
                Repo:{' '}
                <a
                  className="text-sky hover:text-mint"
                  href={repositoryUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {repositoryUrl}
                </a>
              </p>
              <p className="mt-2 break-words">
                Support:{' '}
                <a
                  className="text-sky hover:text-amber"
                  href={paypalUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {paypalUrl}
                </a>
              </p>
            </footer>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatusPanel({ status }: { status: Status }) {
  const tone = {
    idle: 'border-line text-slate-300',
    working: 'border-sky text-sky',
    success: 'border-mint text-mint',
    warning: 'border-amber text-amber',
    error: 'border-coral text-coral'
  }[status.kind];

  return (
    <div className={`rounded-md border bg-panel px-4 py-3 text-sm ${tone}`} role="status">
      {status.message}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-ink p-3">
      <dt className="text-xs uppercase tracking-normal text-slate-500">{label}</dt>
      <dd className="mt-1 truncate font-mono text-sm text-slate-100">{value}</dd>
    </div>
  );
}
