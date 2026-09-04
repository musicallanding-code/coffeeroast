import { isDemoMode } from '@/demo/demoStore';
import { AppText, Card } from '@/components/ui/kit';
import { t } from '@/i18n/zh-TW';

/**
 * Shown on data screens when there's no Supabase connection: a neutral "demo
 * mode" note (real seed data is populated in this mode — see src/demo/).
 */
export function SetupNotice() {
  if (!isDemoMode) return null;
  return (
    <Card style={{ borderStyle: 'dashed' }}>
      <AppText variant="label" color="accent">
        ✦ {t.demo.banner}
      </AppText>
    </Card>
  );
}
