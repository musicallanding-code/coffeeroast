import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createSensor } from './createSensor';
import { loadSensorConfig, saveSensorConfig } from './sensorConfig';
import { DEFAULT_SENSOR_CONFIG, type Sensor, type SensorConfig } from './types';

type SensorContextValue = {
  config: SensorConfig;
  ready: boolean;
  setConfig: (next: SensorConfig) => Promise<void>;
  /** A fresh sensor instance for one roast session. Caller owns connect/disconnect. */
  makeSensor: () => Sensor;
};

const SensorContext = createContext<SensorContextValue | null>(null);

export function SensorProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<SensorConfig>(DEFAULT_SENSOR_CONFIG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSensorConfig().then((c) => {
      setConfigState(c);
      setReady(true);
    });
  }, []);

  const setConfig = useCallback(async (next: SensorConfig) => {
    setConfigState(next);
    await saveSensorConfig(next);
  }, []);

  const value = useMemo<SensorContextValue>(
    () => ({
      config,
      ready,
      setConfig,
      makeSensor: () => createSensor(config),
    }),
    [config, ready, setConfig],
  );

  return <SensorContext.Provider value={value}>{children}</SensorContext.Provider>;
}

export function useSensorConfig() {
  const ctx = useContext(SensorContext);
  if (!ctx) throw new Error('useSensorConfig must be used within SensorProvider');
  return ctx;
}
