import { useMemo, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { Radius } from '@/constants/theme';
import type { CurvePoint, RoastEvent } from '@/db/types';
import { t } from '@/i18n/zh-TW';
import { useTheme } from '@/hooks/use-theme';
import { formatClock } from '@/roast/roastMath';

type Props = {
  points: CurvePoint[];
  events?: RoastEvent[];
  height?: number;
  minSpanSec?: number;
  showDrum?: boolean;
};

const PAD = { left: 34, right: 12, top: 12, bottom: 22 };

export function RoastChart({ points, events = [], height = 260, minSpanSec = 600, showDrum = true }: Props) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const model = useMemo(() => {
    const lastSec = points.length ? points[points.length - 1].tSec : 0;
    const maxSec = Math.max(minSpanSec, Math.ceil((lastSec + 30) / 60) * 60);

    let tMin = 40;
    let tMax = 240;
    if (points.length) {
      const temps = points.flatMap((p) =>
        showDrum && p.drumTemp != null ? [p.beanTemp, p.drumTemp] : [p.beanTemp],
      );
      tMin = Math.max(0, Math.floor((Math.min(...temps) - 15) / 10) * 10);
      tMax = Math.min(320, Math.ceil((Math.max(...temps) + 15) / 10) * 10);
      if (tMax - tMin < 60) tMax = tMin + 60;
    }
    return { maxSec, tMin, tMax };
  }, [points, showDrum, minSpanSec]);

  const plotW = Math.max(1, width - PAD.left - PAD.right);
  const plotH = Math.max(1, height - PAD.top - PAD.bottom);
  const sx = (sec: number) => PAD.left + (sec / model.maxSec) * plotW;
  const sy = (temp: number) =>
    PAD.top + plotH - ((temp - model.tMin) / (model.tMax - model.tMin)) * plotH;

  const line = (key: 'beanTemp' | 'drumTemp') => {
    const pts = points.filter((p) => (key === 'beanTemp' ? true : p.drumTemp != null));
    if (pts.length < 2) return '';
    return pts
      .map((p, i) => {
        const v = key === 'beanTemp' ? p.beanTemp : (p.drumTemp as number);
        return `${i === 0 ? 'M' : 'L'}${sx(p.tSec).toFixed(1)},${sy(v).toFixed(1)}`;
      })
      .join(' ');
  };

  const timeTicks: number[] = [];
  const step = model.maxSec <= 600 ? 120 : model.maxSec <= 1200 ? 180 : 300;
  for (let s = 0; s <= model.maxSec; s += step) timeTicks.push(s);

  const tempTicks: number[] = [];
  const tStep = model.tMax - model.tMin > 160 ? 40 : 20;
  for (let d = Math.ceil(model.tMin / tStep) * tStep; d <= model.tMax; d += tStep) tempTicks.push(d);

  const last = points[points.length - 1];

  return (
    <View onLayout={onLayout} style={{ width: '100%', height, borderRadius: Radius.md, overflow: 'hidden' }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Rect x={0} y={0} width={width} height={height} fill={theme.background} />

          {tempTicks.map((d) => (
            <G key={`h${d}`}>
              <Line x1={PAD.left} y1={sy(d)} x2={width - PAD.right} y2={sy(d)} stroke={theme.border} strokeWidth={1} />
              <SvgText x={PAD.left - 4} y={sy(d) + 3} fontSize={9} fill={theme.textSecondary} textAnchor="end">
                {d}
              </SvgText>
            </G>
          ))}

          {timeTicks.map((s) => (
            <G key={`v${s}`}>
              <Line x1={sx(s)} y1={PAD.top} x2={sx(s)} y2={PAD.top + plotH} stroke={theme.border} strokeWidth={1} />
              <SvgText x={sx(s)} y={height - 8} fontSize={9} fill={theme.textSecondary} textAnchor="middle">
                {formatClock(s)}
              </SvgText>
            </G>
          ))}

          {showDrum && <Path d={line('drumTemp')} stroke={theme.drumTemp} strokeWidth={1.5} strokeDasharray="4 3" fill="none" />}
          <Path d={line('beanTemp')} stroke={theme.beanTemp} strokeWidth={2.5} fill="none" strokeLinejoin="round" />

          {events.map((ev) => (
            <G key={ev.kind}>
              <Line x1={sx(ev.tSec)} y1={PAD.top} x2={sx(ev.tSec)} y2={PAD.top + plotH} stroke={theme.marker} strokeWidth={1} strokeDasharray="2 2" />
              <SvgText x={sx(ev.tSec) + 3} y={PAD.top + 10} fontSize={9} fill={theme.marker}>
                {t.roast.events[ev.kind]}
              </SvgText>
            </G>
          ))}

          {last && (
            <Circle cx={sx(last.tSec)} cy={sy(last.beanTemp)} r={3.5} fill={theme.beanTemp} />
          )}
        </Svg>
      )}
    </View>
  );
}
