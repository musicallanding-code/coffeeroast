import { Platform } from 'react-native';

/**
 * Lazy access to react-native-ble-plx. It is a native module that is NOT present
 * in Expo Go, so we never import it at module scope — only through here, guarded.
 */

type AnyBleManager = any;

let managerPromise: Promise<AnyBleManager | null> | null = null;

export function isBleSupported(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    const mod = require('react-native-ble-plx');
    return !!(mod?.BleManager ?? mod?.default?.BleManager);
  } catch {
    return false;
  }
}

export async function getBleManager(): Promise<AnyBleManager | null> {
  if (Platform.OS === 'web') return null;
  if (!managerPromise) {
    managerPromise = (async () => {
      try {
        const mod = require('react-native-ble-plx');
        const BleManager = mod.BleManager ?? mod.default?.BleManager;
        return BleManager ? new BleManager() : null;
      } catch {
        return null;
      }
    })();
  }
  return managerPromise;
}

export type ScannedDevice = { id: string; name: string | null; rssi: number | null };

/** Scan for nearby BLE peripherals for `durationMs`, de-duplicated by id. */
export async function scanDevices(
  durationMs: number,
  onDevice: (d: ScannedDevice) => void,
): Promise<void> {
  const manager = await getBleManager();
  if (!manager) throw new Error('BLE 不支援（需要 dev build，Expo Go 無法使用）。');

  const seen = new Set<string>();
  await new Promise<void>((resolve, reject) => {
    manager.startDeviceScan(null, { allowDuplicates: false }, (error: any, device: any) => {
      if (error) {
        manager.stopDeviceScan();
        reject(error);
        return;
      }
      if (device && !seen.has(device.id)) {
        seen.add(device.id);
        onDevice({ id: device.id, name: device.name ?? device.localName ?? null, rssi: device.rssi ?? null });
      }
    });
    setTimeout(() => {
      manager.stopDeviceScan();
      resolve();
    }, durationMs);
  });
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Decode base64 (as react-native-ble-plx returns characteristic values). */
export function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = Math.floor((clean.length * 3) / 4);
  const out = new Uint8Array(len);
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n =
      (B64.indexOf(clean[i]) << 18) |
      (B64.indexOf(clean[i + 1]) << 12) |
      ((B64.indexOf(clean[i + 2]) & 63) << 6) |
      (B64.indexOf(clean[i + 3]) & 63);
    out[p++] = (n >> 16) & 255;
    if (i + 2 < clean.length) out[p++] = (n >> 8) & 255;
    if (i + 3 < clean.length) out[p++] = n & 255;
  }
  return out;
}
