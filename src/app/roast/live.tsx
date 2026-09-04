import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { RoastChart } from '@/components/RoastChart';
import { AppText, Button, Card, Row } from '@/components/ui/kit';
import { Radius, Spacing } from '@/constants/theme';
import type { RoastEventKind } from '@/db/types';
import { t } from '@/i18n/zh-TW';
import { formatClock, rateOfRise } from '@/roast/roastMath';
import { useSessionStore } from '@/roast/sessionStore';
import { useRoastKeepAwake } from '@/roast/useRoastKeepAwake';
import { useSensorConfig } from '@/sensors/SensorProvider';
import type { Sensor, SensorStatus } from '@/sensors/types';
import { useTheme } from '@/hooks/use-theme';

const MARK_BUTTONS: RoastEventKind[] = ['turning_point', 'dry_end', 'first_crack', 'second_crack'];

export default function LiveRoastScreen() {
  useRoastKeepAwake();
  const router = useRouter();
  const theme = useTheme();
  const { makeSensor } = useSensorConfig();
  const sensorRef = useRef<Sensor | null>(null);
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>('idle');
  const [sensorLabel, setSensorLabel] = useState('');

  const status = useSessionStore((s) => s.status);
  const points = useSessionStore((s) => s.points);
  const events = useSessionStore((s) => s.events);
  const elapsedSec = useSessionStore((s) => s.elapsedSec);
  const beanTemp = useSessionStore((s) => s.latestBeanTemp);
  const drumTemp = useSessionStore((s) => s.latestDrumTemp);
  const gas = useSessionStore((s) => s.gas);
  const airflow = useSessionStore((s) => s.airflow);
  const config = useSessionStore((s) => s.config);
  const setControls = useSessionStore((s) => s.setControls);
  const mark = useSessionStore((s) => s.mark);
  const unmark = useSessionStore((s) => s.unmark);
  const finish = useSessionStore((s) => s.finish);
  const reset = useSessionStore((s) => s.reset);

  useEffect(() => {
    if (status === 'idle') router.replace('/roast/start');
  }, [status, router]);

  useEffect(() => {
    const sensor = makeSensor();
    sensorRef.current = sensor;
    setSensorLabel(sensor.label);
    setSensorStatus(sensor.getStatus());
    const unsub = sensor.subscribe((r) => useSessionStore.getState().ingest(r));
    const unsubStatus = sensor.subscribeStatus(setSensorStatus);
    sensor.connect().catch((e: unknown) => {
      Alert.alert(
        t.roast.sensorConnectFailed,
        e instanceof Error ? e.message : String(e),
        [{ text: t.common.confirm }],
      );
    });
    return () => {
      unsub();
      unsubStatus();
      sensor.disconnect();
      sensorRef.current = null;
    };
    // makeSensor is stable per config; we intentionally start one session's sensor once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sensorRef.current?.applyControls?.(gas, airflow);
  }, [gas, airflow]);

  const ror = useMemo(() => rateOfRise(points), [points]);

  const drop = () => {
    sensorRef.current?.disconnect();
    finish();
    router.replace('/roast/summary');
  };

  const discard = () => {
    Alert.alert(t.roast.discardConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.confirm,
        style: 'destructive',
        onPress: () => {
          sensorRef.current?.disconnect();
          reset();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: Spacing.three, gap: Spacing.three }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <AppText variant="caption" color="textSecondary" numberOfLines={1} style={{ flex: 1 }}>
          {config.beanName || t.roast.newTitle}
          {config.greenWeightG ? ` · ${config.greenWeightG}${t.common.grams}` : ''}
        </AppText>
        <Pressable onPress={discard} hitSlop={10}>
          <Ionicons name="stop-circle-outline" size={22} color={theme.textSecondary} />
        </Pressable>
      </Row>

      <Row style={{ gap: Spacing.two }}>
        <Metric label={t.roast.elapsed} value={formatClock(elapsedSec)} />
        <Metric label={t.roast.beanTemp} value={beanTemp != null ? `${beanTemp.toFixed(1)}°` : '–'} accent />
        <Metric label={t.roast.ror} value={ror != null ? `${ror.toFixed(1)}` : '–'} sub="°C/min" />
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <AppText variant="caption" color="textSecondary">
          {t.roast.drumTemp}: {drumTemp != null ? `${drumTemp.toFixed(1)}°C` : '–'}
        </AppText>
        <AppText
          variant="caption"
          color={sensorStatus === 'error' ? 'danger' : sensorStatus === 'connected' ? 'success' : 'textSecondary'}>
          {sensorLabel} · {t.roast.sensorStatus[sensorStatus]}
        </AppText>
      </Row>

      <Card style={{ padding: Spacing.one }}>
        <RoastChart points={points} events={events} height={240} />
      </Card>

      <View style={styles.grid}>
        {MARK_BUTTONS.map((kind) => {
          const ev = events.find((e) => e.kind === kind);
          return (
            <Pressable
              key={kind}
              onPress={() => (ev ? unmark(kind) : mark(kind))}
              style={[
                styles.markBtn,
                {
                  backgroundColor: ev ? theme.tint : theme.backgroundElement,
                  borderColor: ev ? theme.tint : theme.border,
                },
              ]}>
              <AppText color={ev ? 'tintText' : 'text'} variant="label">
                {t.roast.events[kind]}
              </AppText>
              <AppText color={ev ? 'tintText' : 'textSecondary'} variant="caption">
                {ev ? `${formatClock(ev.tSec)} · ${ev.temp?.toFixed(0) ?? '–'}°` : '—'}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <Stepper label={t.roast.gas} value={gas} onChange={(v) => setControls({ gas: v })} />
      <Stepper label={t.roast.airflow} value={airflow} onChange={(v) => setControls({ airflow: v })} />

      <Button label={t.roast.drop} onPress={drop} style={{ backgroundColor: theme.accent, marginTop: Spacing.two }} />
      <View style={{ height: Spacing.five }} />
    </ScrollView>
  );
}

function Metric({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  const theme = useTheme();
  return (
    <Card style={{ flex: 1, gap: 2, paddingVertical: Spacing.two }}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText style={{ fontSize: 24, fontWeight: '700', color: accent ? theme.beanTemp : theme.text }}>
        {value}
      </AppText>
      {sub ? (
        <AppText variant="caption" color="textSecondary">
          {sub}
        </AppText>
      ) : null}
    </Card>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const theme = useTheme();
  const clamp = (v: number) => Math.min(10, Math.max(0, Math.round(v * 2) / 2));
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <AppText variant="label">{label}</AppText>
      <Row style={{ gap: Spacing.three }}>
        <Pressable onPress={() => onChange(clamp(value - 0.5))} hitSlop={8} style={[styles.step, { borderColor: theme.border }]}>
          <Ionicons name="remove" size={18} color={theme.text} />
        </Pressable>
        <AppText style={{ fontSize: 18, fontWeight: '700', minWidth: 40, textAlign: 'center' }}>
          {value.toFixed(1)}
        </AppText>
        <Pressable onPress={() => onChange(clamp(value + 0.5))} hitSlop={8} style={[styles.step, { borderColor: theme.border }]}>
          <Ionicons name="add" size={18} color={theme.text} />
        </Pressable>
      </Row>
    </Row>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  markBtn: {
    flexGrow: 1,
    flexBasis: '47%',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.two,
    gap: 2,
    alignItems: 'flex-start',
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
