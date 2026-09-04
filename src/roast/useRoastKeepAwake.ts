import { useEffect } from 'react';
import { Platform } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const TAG = 'coffeeroast-roast-session';

/**
 * Keeps the screen on during a live roast. No-op on web — the default
 * `useKeepAwake` throws there when the component unmounts before the browser
 * wake-lock promise resolves, and a desktop browser tab does not sleep anyway.
 */
export function useRoastKeepAwake() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let active = false;
    activateKeepAwakeAsync(TAG)
      .then(() => {
        active = true;
      })
      .catch(() => {});
    return () => {
      if (active) {
        try {
          deactivateKeepAwake(TAG);
        } catch {
          // ignore — lock may already be gone
        }
      }
    };
  }, []);
}
