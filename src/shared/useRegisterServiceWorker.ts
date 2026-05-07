import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { logger } from './logger';

export function useRegisterServiceWorker() {
  useEffect(() => {
    const update = registerSW({
      immediate: true,
      onRegisteredSW() {
        logger.debug('service worker registered');
      },
      onRegisterError(error) {
        logger.warn('service worker registration failed', error);
      },
      onNeedRefresh() {
        update(true).catch((error: unknown) => logger.warn('service worker refresh failed', error));
      }
    });
  }, []);
}
