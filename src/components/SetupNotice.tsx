import { isSupabaseConfigured } from '@/lib/supabase';
import { AppText, Card } from '@/components/ui/kit';
import { t } from '@/i18n/zh-TW';

/** Shown on data screens until the user fills in their Supabase keys. */
export function SetupNotice() {
  if (isSupabaseConfigured) return null;
  return (
    <Card style={{ borderStyle: 'dashed' }}>
      <AppText variant="label" color="danger">
        ⚠︎ {t.errors.missingSupabase}
      </AppText>
    </Card>
  );
}
