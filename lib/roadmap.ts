import { createClient } from '@/lib/supabase/server';
import type { RoadmapSection } from '@/components/RoadmapView';

export async function getRoadmap(): Promise<RoadmapSection[]> {
  const supabase = await createClient();

  const { data: sections, error: sectionsError } = await supabase
    .from('roadmap_sections')
    .select('id, order_index, title_az, title_en')
    .order('order_index');

  if (sectionsError || !sections) return [];

  const { data: topics } = await supabase
    .from('roadmap_topics')
    .select('id, section_id, order_index, title_az, title_en, video_status, bunny_video_id, thumbnail_url')
    .order('order_index');

  return sections.map((section) => ({
    ...section,
    topics: (topics ?? []).filter((t) => t.section_id === section.id)
  }));
}

export async function getMonetizationEnabled(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'monetization_enabled')
    .single();
  return data?.value === true;
}
