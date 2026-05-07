import { ErrorBoundary } from './shared/ErrorBoundary';
import { useRegisterServiceWorker } from './shared/useRegisterServiceWorker';
import { LooperApp } from './features/looper/LooperApp';

export function App() {
  useRegisterServiceWorker();

  return (
    <ErrorBoundary>
      <LooperApp />
    </ErrorBoundary>
  );
}
