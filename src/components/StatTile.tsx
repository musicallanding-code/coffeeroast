import { View } from 'react-native';

import { AppText, Card } from '@/components/ui/kit';

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card style={{ flex: 1, alignItems: 'flex-start' }}>
      <AppText variant="display">{value}</AppText>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <View />
    </Card>
  );
}
