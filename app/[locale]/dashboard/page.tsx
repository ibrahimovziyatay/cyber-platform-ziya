import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getRoadmap } from '@/lib/roadmap';
import DashboardRoadmap from '@/components/VideoPlayerModal';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single();

  const sections = await getRoadmap();
  const allTopics = sections.flatMap((s) => s.topics);
  const totalTopics = allTopics.length;
  const videoTopics = allTopics.filter((t) => t.video_status === 'has_video').length;

  const { count: completedCount } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id);

  const currentSection =
    sections.find((s) => s.topics.some((t) => t.video_status !== 'has_video')) ?? sections[0];

  return (
    <main className="max-w-[1120px] mx-auto px-6 py-10">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {t('welcome')}, {profile?.full_name ?? user?.email}
          </h1>
          <p className="text-text-2 text-sm mt-1.5">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-9">
        <div className="card !p-5">
          <div className="font-mono text-[11px] text-text-3 mb-2.5">{t('statProgress')}</div>
          <div className="font-display text-[22px] font-semibold text-success">
            {completedCount ?? 0} / {totalTopics} {t('topicsCount')}
          </div>
        </div>
        <div className="card !p-5">
          <div className="font-mono text-[11px] text-text-3 mb-2.5">{t('statVideos')}</div>
          <div className="font-display text-[22px] font-semibold">
            {videoTopics} / {totalTopics}
          </div>
        </div>
        <div className="card !p-5">
          <div className="font-mono text-[11px] text-text-3 mb-2.5">{t('statCurrentSection')}</div>
          <div className="font-display text-[22px] font-semibold">
            {currentSection ? `${currentSection.order_index} · ${currentSection.title_az}` : '—'}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <span className="font-mono text-xs text-accent-2 mb-3 block">// roadmap</span>
        <h2 className="font-display text-xl font-semibold mb-1.5">{t('roadmapTitle')}</h2>
        <p className="text-text-3 text-[13px]">{t('roadmapLegend')}</p>
      </div>

      <DashboardRoadmap sections={sections} />
    </main>
  );
}
