import { useTranslations, useLocale } from 'next-intl';

export interface RoadmapTopic {
  id: string;
  order_index: number;
  title_az: string;
  title_en: string;
  video_status: 'text_only' | 'has_video' | 'coming_soon';
  bunny_video_id: string | null;
}

export interface RoadmapSection {
  id: string;
  order_index: number;
  title_az: string;
  title_en: string;
  topics: RoadmapTopic[];
}

function StatusTag({ status }: { status: RoadmapTopic['video_status'] }) {
  const t = useTranslations('dashboard');

  if (status === 'has_video') {
    return <span className="badge badge-video">🎬 {t('hasVideo')}</span>;
  }
  if (status === 'text_only') {
    return <span className="badge badge-none">📄 {t('textOnly')}</span>;
  }
  return <span className="badge badge-soon">⏳ {t('comingSoon')}</span>;
}

export default function RoadmapView({
  sections,
  compact = false,
  onTopicClick
}: {
  sections: RoadmapSection[];
  compact?: boolean;
  onTopicClick?: (topic: RoadmapTopic) => void;
}) {
  const locale = useLocale();
  const t = useTranslations('dashboard');

  const visibleSections = compact ? sections.slice(0, 2) : sections;

  return (
    <div className="relative">
      {visibleSections.map((section, sIdx) => {
        const topics = compact ? section.topics.slice(0, 3) : section.topics;
        const isLast = sIdx === visibleSections.length - 1;

        return (
          <div key={section.id} className="relative pl-7 pb-6 last:pb-0">
            {!isLast && (
              <span className="absolute left-2 top-6 bottom-0 w-0.5 bg-border" aria-hidden />
            )}
            <span className="absolute left-0.5 top-0.5 w-[15px] h-[15px] rounded-full bg-accent-soft border-2 border-accent" aria-hidden />

            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[11.5px] font-semibold uppercase tracking-wide text-text-1">
                {section.order_index} · {locale === 'az' ? section.title_az : section.title_en}
              </div>
              <div className="font-mono text-[11px] text-text-3">
                {topics.length} {t('topicsCount')}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {topics.map((topic) => {
                const content = (
                  <>
                    <span className="text-text-1 text-[13.5px] font-medium">
                      {locale === 'az' ? topic.title_az : topic.title_en}
                    </span>
                    <StatusTag status={topic.video_status} />
                  </>
                );

                if (!onTopicClick) {
                  return (
                    <div
                      key={topic.id}
                      className="bg-panel border border-border rounded-lg px-4 py-2.5 flex items-center justify-between gap-2.5"
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <button
                    key={topic.id}
                    onClick={() => onTopicClick(topic)}
                    className="bg-panel border border-border rounded-lg px-4 py-2.5 flex items-center justify-between gap-2.5 text-left hover:border-accent-soft-2 transition-colors"
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
