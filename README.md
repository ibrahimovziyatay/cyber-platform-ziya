# CyberSecurity Fundamentals

Kibertəhlükəsizlik təhsil platforması — TryHackMe Pre-Security strukturuna əsaslanan
roadmap, ikidilli (AZ/EN) kontent, Payriff/Stripe ödəniş strukturu, Bunny.net video
inteqrasiyası və admin panel.

## 1. Quraşdırma

```bash
npm install
cp .env.example .env.local
```

`.env.local` faylını doldurun (aşağıdakı bölmələrə baxın).

## 2. Supabase qurulumu

1. [supabase.com](https://supabase.com) üzərində yeni layihə yaradın.
2. **Project Settings → API** bölməsindən `Project URL`, `anon public key` və
   `service_role key` dəyərlərini götürüb `.env.local`-a yazın.
3. **SQL Editor**-ə keçin, `supabase/schema.sql` faylının bütün məzmununu
   yapışdırıb işə salın. Bu, bütün cədvəlləri, RLS siyasətlərini və
   TryHackMe strukturuna uyğun 5 bölmə / 18 mövzu seed datasını yaradacaq.

   > **Roadmap strukturunu dəyişmisiniz və artıq schema.sql-i işə salmısınız?**
   > `supabase/roadmap_reset.sql` faylını SQL Editor-də işə salın — köhnə
   > roadmap məlumatlarını silib yenisi ilə əvəz edir (diqqət: mövcud
   > istifadəçi irəliləyişi də silinir).
4. **Authentication → Providers**-də Email/Password aktivdir (default).
5. İlk admin istifadəçinizi təyin etmək üçün, qeydiyyatdan keçdikdən sonra
   SQL Editor-də:
   ```sql
   update public.profiles set is_admin = true where email = 'sizin@email.com';
   ```

## 3. Development

```bash
npm run dev
```

`http://localhost:3000` → avtomatik `/az`-a yönləndirilir.

## 4. Monetizasiya (pulsuz → pullu keçid)

Layihə `site_settings.monetization_enabled = false` ilə başlayır — yəni
**bütün istifadəçilər bütün videolara pulsuz giriş əldə edir**, checkout axını
işə düşmür. Siz hazır olduğunuzda:

- Admin panelə daxil olun (`/az/admin`)
- "Monetizasiya" açarını aktivləşdirin

Bundan sonra `is_free_preview = false` olan mövzular üçün aktiv abunəlik
tələb olunacaq. Kodda heç bir dəyişiklik lazım deyil.

## 5. Ödəniş inteqrasiyası

### Payriff (Azərbaycan)
`lib/payments/payriff.ts` — default olaraq `PAYRIFF_MODE=mock` ilə işləyir,
yəni real Payriff hesabı olmadan bütün checkout axınını test edə bilərsiniz.
Real inteqrasiya üçün:
1. Payriff-də merchant hesabı açın, `PAYRIFF_MERCHANT_ID` və
   `PAYRIFF_SECRET_KEY` alın.
2. `.env.local`-da `PAYRIFF_MODE=live` edin.
3. Payriff-in rəsmi API sənədlərinə uyğun olaraq `createPayriffOrder`
   funksiyasındakı endpoint/parametrləri yoxlayın (Payriff API versiyaları
   zaman keçdikcə dəyişə bilər).

### Stripe (beynəlxalq)
`lib/payments/stripe.ts` — `STRIPE_SECRET_KEY` və `STRIPE_PRICE_ID_MONTHLY`
olmadıqda mock rejimdə işləyir. Real inteqrasiya üçün Stripe Dashboard-da
aylıq subscription price yaradın və ID-ni `.env.local`-a əlavə edin.

### Webhook-lar
- `app/api/payriff/webhook/route.ts`
- `app/api/stripe/webhook/route.ts`

Hər ikisi `subscriptions` cədvəlini `service_role` açarı ilə yeniləyir (RLS-i
bypass edir, çünki bu, etibarlı server-tərəfli kontekstdir).

## 6. Video hostinq (Bunny.net)

`lib/video/bunny.ts` — Bunny.net Stream-də video yükləyib əldə etdiyiniz
Video GUID-i admin paneldən mövzuya əlavə edirsiniz (`bunnyVideoId` sahəsi).
Frontend heç vaxt bu ID-ni birbaşa ictimai URL kimi göstərmir — hər izləmə
tələbi `/api/video/[topicId]` route-undan keçir, orada:

1. İstifadəçinin girişi yoxlanılır (`lib/access.ts`)
2. Yalnız icazə varsa, qısamüddətli (1 saat) imzalanmış Bunny.net URL-i
   generasiya olunur

`BUNNY_TOKEN_AUTH_KEY` üçün Bunny.net Stream library-nizdə "Token
Authentication"-ı aktivləşdirib security key-i `.env.local`-a əlavə edin.

## 7. Layihə strukturu

```
app/[locale]/           → bütün səhifələr (az/en prefiksli)
  page.tsx               → Ana səhifə
  login/, register/      → Autentifikasiya
  dashboard/              → Qorunan roadmap görünüşü
  checkout/               → Abunəlik ödənişi
  services/               → Audit/konsaltinq + sifariş forması
  admin/                  → Admin panel (yalnız is_admin=true)
app/api/                 → API route-ları (checkout, webhook-lar, video)
components/              → Header, Footer, RoadmapView, AdminPanel və s.
lib/
  supabase/               → browser/server/middleware klientləri
  payments/               → Payriff + Stripe strukturu
  video/                  → Bunny.net signed URL
  access.ts               → mərkəzi giriş nəzarəti (monetization/subscription)
  roadmap.ts               → roadmap data fetch helper
i18n/                    → next-intl routing/navigation/request config
messages/az.json, en.json → bütün UI mətnləri
supabase/schema.sql       → tam DB sxemi + RLS + seed data
```

## 8. Deploy

Vercel tövsiyə olunur (Next.js App Router üçün native dəstək):

```bash
vercel deploy
```

Bütün `.env.local` dəyişənlərini Vercel Project Settings → Environment
Variables bölməsinə əlavə etməyi unutmayın.

## 9. Növbəti addımlar

- [ ] Roadmap mövzularına videoları admin paneldən əlavə edin
- [ ] Real Payriff/Stripe kredensiallarını əlavə edin
- [ ] Real Bunny.net library qurun
- [ ] Hazır olanda monetizasiyanı aktivləşdirin
