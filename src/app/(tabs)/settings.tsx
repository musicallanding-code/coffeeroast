import Constants from 'expo-constants';
import { View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { SetupNotice } from '@/components/SetupNotice';
import { AppText, Button, Card, Row, Screen } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { t } from '@/i18n/zh-TW';

export default function SettingsScreen() {
  const { session, signOut, configured } = useAuth();

  return (
    <Screen scroll>
      <SetupNotice />

      <Card>
        <AppText variant="label" color="textSecondary">
          {t.settings.account}
        </AppText>
        {configured && session ? (
          <>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText color="textSecondary">{t.auth.email}</AppText>
              <AppText>{session.user.email}</AppText>
            </Row>
            <Button label={t.auth.signOut} variant="secondary" onPress={signOut} style={{ marginTop: Spacing.two }} />
          </>
        ) : (
          <AppText color="textSecondary">{t.errors.missingSupabase}</AppText>
        )}
      </Card>

      <Card>
        <AppText variant="label" color="textSecondary">
          {t.settings.sensor}
        </AppText>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText>{t.roast.sensorSource}</AppText>
          <AppText>{t.roast.sensorMock}</AppText>
        </Row>
        <AppText variant="caption" color="textSecondary">
          {t.settings.sensorMockNote}
        </AppText>
      </Card>

      <Card>
        <AppText variant="label" color="textSecondary">
          {t.settings.about}
        </AppText>
        <Row style={{ justifyContent: 'space-between' }}>
          <AppText>{t.settings.version}</AppText>
          <AppText>{Constants.expoConfig?.version ?? '—'}</AppText>
        </Row>
      </Card>
      <View />
    </Screen>
  );
}
