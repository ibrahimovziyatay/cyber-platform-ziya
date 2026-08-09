import { createClient } from '@/lib/supabase/server';

export interface AccessCheckResult {
  canWatch: boolean;
  reason: 'monetization_disabled' | 'free_preview' | 'active_subscription' | 'requires_subscription';
}

/**
 * Central access-control check. Called before generating a signed
 * Bunny.net URL for a topic's video.
 *
 * Logic:
 * 1. If site-wide monetization is OFF -> everyone can watch (launch phase).
 * 2. If the topic is marked as a free preview -> everyone can watch.
 * 3. Otherwise -> user must have an active subscription.
 */
export async function canUserWatchTopic(
  userId: string | null,
  topic: { is_free_preview: boolean }
): Promise<AccessCheckResult> {
  const supabase = await createClient();

  const { data: setting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'monetization_enabled')
    .single();

  const monetizationEnabled = setting?.value === true;

  if (!monetizationEnabled) {
    return { canWatch: true, reason: 'monetization_disabled' };
  }

  if (topic.is_free_preview) {
    return { canWatch: true, reason: 'free_preview' };
  }

  if (!userId) {
    return { canWatch: false, reason: 'requires_subscription' };
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .single();

  const isActive =
    subscription?.status === 'active' &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end) > new Date());

  return isActive
    ? { canWatch: true, reason: 'active_subscription' }
    : { canWatch: false, reason: 'requires_subscription' };
}
