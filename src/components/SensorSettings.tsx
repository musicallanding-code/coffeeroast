import { useRef, useState } from 'react';
import { View } from 'react-native';

import { PickerRow } from '@/components/PickerRow';
import { AppText, Button, Card, Segmented, TextField } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { t } from '@/i18n/zh-TW';
import { isBleSupported, scanDevices, type ScannedDevice } from '@/sensors/ble';
import { createSensor } from '@/sensors/createSensor';
import { DEFAULT_BLE_UUIDS } from '@/sensors/sensorConfig';
import { useSensorConfig } from '@/sensors/SensorProvider';
import { PARSER_LABELS } from '@/sensors/parsers';
import type { ParserId, SensorConfig, SensorKind, SensorReading } from '@/sensors/types';
import { isWebSerialSupported, requestSerialPort } from '@/sensors/WebSerialSensor';

const PARSER_IDS: ParserId[] = ['ascii-number', 'ascii-bt-et', 'artisan-csv', 'int16-centi'];
const BAUD_RATES = [9600, 19200, 38400, 57600, 115200];

export function SensorSettings() {
  const { config, setConfig } = useSensorConfig();
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [testReading, setTestReading] = useState<SensorReading | null>(null);
  const [testing, setTesting] = useState(false);
  const testTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = (patch: Partial<SensorConfig>) => setConfig({ ...config, ...patch });

  const setKind = (kind: SensorKind) => {
    if (kind === 'ble') {
      update({ kind, ble: config.ble ?? { deviceId: '', ...DEFAULT_BLE_UUIDS, parser: 'ascii-number' } });
    } else if (kind === 'webserial') {
      update({ kind, webserial: config.webserial ?? { baudRate: 115200, parser: 'ascii-bt-et' } });
    } else {
      update({ kind });
    }
  };

  const runScan = async () => {
    setDevices([]);
    setScanning(true);
    try {
      await scanDevices(8000, (d) => setDevices((prev) => (prev.some((x) => x.id === d.id) ? prev : [...prev, d])));
    } catch {
      // surfaced via unsupported note
    } finally {
      setScanning(false);
    }
  };

  const testRead = async () => {
    setTestReading(null);
    setTesting(true);
    const sensor = createSensor(config);
    const unsub = sensor.subscribe(setTestReading);
    try {
      await sensor.connect();
    } catch {
      setTesting(false);
      unsub();
      return;
    }
    testTimer.current = setTimeout(() => {
      unsub();
      sensor.disconnect();
      setTesting(false);
    }, 6000);
  };

  const parserPicker = (value: ParserId, onChange: (p: ParserId) => void) => (
    <PickerRow
      label={t.settings.parser}
      value={value}
      onChange={(v) => v && onChange(v as ParserId)}
      options={PARSER_IDS.map((p) => ({ value: p, label: PARSER_LABELS[p] }))}
    />
  );

  return (
    <Card style={{ gap: Spacing.three }}>
      <AppText variant="label" color="textSecondary">
        {t.settings.sensorKind}
      </AppText>
      <Segmented
        value={config.kind}
        onChange={setKind}
        options={[
          { value: 'mock', label: t.settings.kindMock },
          { value: 'ble', label: t.settings.kindBle },
          { value: 'webserial', label: t.settings.kindWebSerial },
        ]}
      />

      {config.kind === 'mock' ? (
        <AppText variant="caption" color="textSecondary">
          {t.settings.sensorMockNote}
        </AppText>
      ) : null}

      {config.kind === 'ble' ? (
        <View style={{ gap: Spacing.three }}>
          <AppText variant="caption" color="textSecondary">
            {t.settings.bleNote}
          </AppText>
          {!isBleSupported() ? (
            <AppText variant="caption" color="danger">
              {t.settings.bleUnavailable}
            </AppText>
          ) : (
            <>
              <Button
                label={scanning ? t.settings.bleScanning : t.settings.bleScan}
                variant="secondary"
                onPress={runScan}
                loading={scanning}
              />
              {devices.length > 0 ? (
                <PickerRow
                  label={t.settings.bleDevice}
                  value={config.ble?.deviceId ?? null}
                  onChange={(id) => {
                    const d = devices.find((x) => x.id === id);
                    update({
                      ble: {
                        ...(config.ble ?? { ...DEFAULT_BLE_UUIDS, parser: 'ascii-number' }),
                        deviceId: id ?? '',
                        deviceName: d?.name ?? undefined,
                      },
                    });
                  }}
                  options={devices.map((d) => ({ value: d.id, label: d.name ?? d.id.slice(0, 8), sub: d.id }))}
                />
              ) : null}
            </>
          )}
          <TextField
            label={t.settings.bleService}
            value={config.ble?.serviceUuid ?? ''}
            autoCapitalize="none"
            onChangeText={(v) =>
              update({ ble: { ...(config.ble ?? { deviceId: '', parser: 'ascii-number', notifyCharUuid: '' }), serviceUuid: v } })
            }
          />
          <TextField
            label={t.settings.bleNotifyChar}
            value={config.ble?.notifyCharUuid ?? ''}
            autoCapitalize="none"
            onChangeText={(v) =>
              update({ ble: { ...(config.ble ?? { deviceId: '', parser: 'ascii-number', serviceUuid: '' }), notifyCharUuid: v } })
            }
          />
          {parserPicker(config.ble?.parser ?? 'ascii-number', (p) =>
            update({ ble: { ...(config.ble ?? { deviceId: '', ...DEFAULT_BLE_UUIDS }), parser: p } }),
          )}
        </View>
      ) : null}

      {config.kind === 'webserial' ? (
        <View style={{ gap: Spacing.three }}>
          <AppText variant="caption" color="textSecondary">
            {t.settings.webSerialNote}
          </AppText>
          {!isWebSerialSupported() ? (
            <AppText variant="caption" color="danger">
              {t.settings.webSerialUnsupported}
            </AppText>
          ) : (
            <Button label={t.settings.webSerialConnect} variant="secondary" onPress={() => requestSerialPort()} />
          )}
          <PickerRow
            label={t.settings.baudRate}
            value={String(config.webserial?.baudRate ?? 115200)}
            onChange={(v) =>
              update({ webserial: { ...(config.webserial ?? { parser: 'ascii-bt-et' }), baudRate: Number(v) } })
            }
            options={BAUD_RATES.map((b) => ({ value: String(b), label: String(b) }))}
          />
          {parserPicker(config.webserial?.parser ?? 'ascii-bt-et', (p) =>
            update({ webserial: { ...(config.webserial ?? { baudRate: 115200 }), parser: p } }),
          )}
        </View>
      ) : null}

      {config.kind !== 'mock' ? (
        <View style={{ gap: Spacing.one }}>
          <Button label={t.settings.testRead} onPress={testRead} loading={testing} variant="ghost" />
          {testReading ? (
            <AppText variant="caption" color="success">
              {t.settings.lastReading}: {testReading.beanTemp.toFixed(1)}°C
              {testReading.drumTemp != null ? ` / ${testReading.drumTemp.toFixed(1)}°C` : ''}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
