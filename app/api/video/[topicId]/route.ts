import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canUserWatchTopic } from '@/lib/access';
import { getSignedBunnyEmbedUrl } from '@/lib/video/bunny';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: topic, error } = await supabase
    .from('roadmap_topics')
    .select('id, is_free_preview, video_status, bunny_video_id')
    .eq('id', topicId)
    .single();

  if (error || !topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  if (topic.video_status !== 'has_video' || !topic.bunny_video_id) {
    return NextResponse.json({ error: 'No video for this topic yet' }, { status: 404 });
  }

  const access = await canUserWatchTopic(user?.id ?? null, topic);

  if (!access.canWatch) {
    return NextResponse.json({ error: 'Subscription required', reason: access.reason }, { status: 403 });
  }

  const embedUrl = getSignedBunnyEmbedUrl(topic.bunny_video_id);
  return NextResponse.json({ embedUrl });
}
