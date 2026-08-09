-- ============================================================
-- Roadmap RESET — silin köhnə strukturu, yeni struktur ilə əvəz edin
--
-- İSTİFADƏ: Əgər Supabase layihənizdə artıq schema.sql-i işə salmısınızsa
-- və roadmap strukturunu YENİ versiya ilə (5 bölmə, 18 mövzu) əvəz etmək
-- istəyirsinizsə, bu faylı SQL Editor-də işə salın.
--
-- DİQQƏT: Bu, mövcud bütün roadmap_sections və roadmap_topics
-- sətirlərini (və onlara bağlı user_progress qeydlərini) SİLİR.
-- Əgər istifadəçilər artıq irəliləyiş qeyd ediblərsə, bu itiriləcək.
-- ============================================================

truncate table public.roadmap_topics cascade;
truncate table public.roadmap_sections cascade;

do $$
declare
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid;
begin
  insert into public.roadmap_sections (order_index, title_az, title_en) values
    (1, 'Kibertəhlükəsizliyə Giriş', 'Introduction to Cyber Security') returning id into s1;
  insert into public.roadmap_sections (order_index, title_az, title_en) values
    (2, 'Şəbəkə Fundamentləri', 'Network Fundamentals') returning id into s2;
  insert into public.roadmap_sections (order_index, title_az, title_en) values
    (3, 'Veb Necə İşləyir', 'How The Web Works') returning id into s3;
  insert into public.roadmap_sections (order_index, title_az, title_en) values
    (4, 'Linux Fundamentləri', 'Linux Fundamentals') returning id into s4;
  insert into public.roadmap_sections (order_index, title_az, title_en) values
    (5, 'Windows Fundamentləri', 'Windows Fundamentals') returning id into s5;

  insert into public.roadmap_topics (section_id, order_index, title_az, title_en, video_status, is_free_preview) values
    (s1, 1, 'Hücum Təhlükəsizliyinə Giriş', 'Offensive Security Intro', 'coming_soon', true),
    (s1, 2, 'Müdafiə Təhlükəsizliyinə Giriş', 'Defensive Security Intro', 'coming_soon', true),
    (s1, 3, 'Kibertəhlükəsizlikdə Karyera', 'Careers in Cyber', 'coming_soon', false),

    (s2, 1, 'Networking Nədir?', 'What is Networking?', 'coming_soon', false),
    (s2, 2, 'LAN-a Giriş', 'Intro to LAN', 'coming_soon', false),
    (s2, 3, 'OSI Modeli', 'OSI Model', 'coming_soon', false),
    (s2, 4, 'Paketlər və Frame-lər', 'Packets & Frames', 'coming_soon', false),
    (s2, 5, 'Şəbəkəni Genişləndirmək', 'Extending Your Network', 'coming_soon', false),

    (s3, 1, 'DNS Ətraflı', 'DNS in Detail', 'coming_soon', false),
    (s3, 2, 'HTTP Ətraflı', 'HTTP in Detail', 'coming_soon', false),
    (s3, 3, 'Vebsaytlar Necə İşləyir', 'How Websites Work', 'coming_soon', false),
    (s3, 4, 'Hamısını Birləşdirmək', 'Putting it all together', 'coming_soon', false),

    (s4, 1, 'Linux Fundamentləri 1-ci Hissə', 'Linux Fundamentals Part 1', 'coming_soon', false),
    (s4, 2, 'Linux Fundamentləri 2-ci Hissə', 'Linux Fundamentals Part 2', 'coming_soon', false),
    (s4, 3, 'Linux Fundamentləri 3-cü Hissə', 'Linux Fundamentals Part 3', 'coming_soon', false),

    (s5, 1, 'Windows Fundamentləri 1', 'Windows Fundamentals 1', 'coming_soon', false),
    (s5, 2, 'Windows Fundamentləri 2', 'Windows Fundamentals 2', 'coming_soon', false),
    (s5, 3, 'Windows Fundamentləri 3', 'Windows Fundamentals 3', 'coming_soon', false);
end $$;
