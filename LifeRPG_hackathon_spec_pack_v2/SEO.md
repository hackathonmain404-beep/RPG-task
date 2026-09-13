# SEO Specification & Competitive Strategy — Life RPG

## 1. Hackathon Judging Context & Core Strategy

Performance and SEO are explicitly named scoring pillars in the official hackathon evaluation criteria. Judges will audit semantic HTML, structured metadata, mobile rendering, asset optimization, and search engine crawlability.

### Golden SEO Architecture Rule
- **The Public Landing Page (`/`) is the primary SEO surface.** It must be completely crawlable, fast, semantic, and indexable without authentication.
- **The Authenticated Application (`/app/*`) is strictly private.** All authenticated routes must output `<meta name="robots" content="noindex, nofollow">` to protect user privacy and avoid search penalty for gated screens.

---

## 2. Public Landing Page Metadata Deck

### A. Title Tag
```html
<title>Life RPG — Turn Everyday Tasks Into Epic Progression & Character Growth</title>
```
*Length: 68 characters. Includes primary brand, core concept, and clear search intent.*

### B. Meta Description
```html
<meta name="description" content="Transform daily habits, study, and workouts into a real RPG adventure. Level up attributes, build streaks, earn gold, and unlock gear with verified database persistence.">
```
*Length: 172 characters. Clear, active, motivating value proposition addressing searchers.*

### C. Canonical & Viewport Tags
```html
<link rel="canonical" href="https://liferpg.app/">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#090c10">
```

### D. Open Graph / Social Sharing Tags (1200 × 630 px)
```html
<!-- Open Graph / Facebook / Discord -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://liferpg.app/">
<meta property="og:title" content="Life RPG — Turn Everyday Tasks Into Epic Progression">
<meta property="og:description" content="Gamify your real-life productivity. Level up attributes, maintain streaks, and spend earned gold in a persistent RPG productivity platform.">
<meta property="og:image" content="https://liferpg.app/og-image.webp">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Life RPG Command Citadel HUD showing character level, streak flame, and today's quests.">

<!-- Twitter / X Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://liferpg.app/">
<meta name="twitter:title" content="Life RPG — Turn Everyday Tasks Into Epic Progression">
<meta name="twitter:description" content="Gamify your real-life productivity. Level up attributes, maintain streaks, and spend earned gold in a persistent RPG productivity platform.">
<meta name="twitter:image" content="https://liferpg.app/og-image.webp">
```

---

## 3. Structured Data (JSON-LD) Implementations

The landing page embeds three verified, schema-compliant JSON-LD script blocks in the `<head>`:

### A. SoftwareApplication Schema
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Life RPG",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "A gamified productivity web application translating real-world daily tasks into RPG progression with non-linear leveling, streaks, attributes, and virtual economy.",
  "screenshot": "https://liferpg.app/og-image.webp",
  "url": "https://liferpg.app/"
}
```

### B. WebSite Schema
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Life RPG",
  "url": "https://liferpg.app/",
  "description": "Turn everyday tasks into RPG character growth."
}
```

### C. FAQPage Schema (Matches visible FAQ accordion)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Life RPG?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Life RPG is a full-stack gamified productivity web application that transforms daily tasks into RPG quests. You earn verified XP, level up across 5 real-world attributes, maintain streaks, and unlock cosmetic gear."
      }
    },
    {
      "@type": "Question",
      "name": "How does the XP and leveling system work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Progression uses a non-linear mathematical curve where each subsequent level requires progressively more XP. XP thresholds are computed securely on the server."
      }
    },
    {
      "@type": "Question",
      "name": "Is progress saved across devices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. All character progression, quest history, streaks, and inventory are persisted in a secure PostgreSQL database."
      }
    }
  ]
}
```

---

## 4. Robots & Crawl Control Configuration

### File: `public/robots.txt`
```text
User-agent: *
Allow: /
Allow: /login
Allow: /register
Disallow: /app/
Disallow: /api/

Sitemap: https://liferpg.app/sitemap.xml
```

### File: `public/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://liferpg.app/</loc>
    <lastmod>2026-09-12</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://liferpg.app/login</loc>
    <lastmod>2026-09-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://liferpg.app/register</loc>
    <lastmod>2026-09-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 5. Semantic Heading Structure & Content Crawlability

To achieve a 100/100 Lighthouse SEO and Accessibility score:
- Strictly **one single `<h1>`** on the page.
- Clear, nested heading hierarchy without skipping levels:

```text
<h1> Your Life is the Game. Start Gaining XP.
  <h2> How Life RPG Works
    <h3> 1. Formulate the Quest
    <h3> 2. Execute in Reality
    <h3> 3. Claim Authoritative Spoils
    <h3> 4. Ascend & Equip
  <h2> Master the 5 Disciplines
    <h3> 🧠 Intellect
    <h3> ⚔️ Strength
    <h3> 📖 Wisdom
    <h3> ✨ Charisma
    <h3> ❤️ Vitality
  <h2> The Non-Linear Progression Engine
  <h2> Verified Database Persistence
  <h2> Frequently Asked Questions
  <h2> Ready to Begin Your Quest?
```

---

## 6. Core Web Vitals Optimization Checklist

| Metric | Target | Optimization Strategy |
|---|---|---|
| **LCP** (Largest Contentful Paint) | **< 1.8s** | Hero graphics use responsive `<picture>` tags with `.webp` format and `fetchpriority="high"`. Text renders immediately with system fallback fonts. |
| **CLS** (Cumulative Layout Shift) | **0.00** | All image elements and icon wrappers specify explicit `width` and `height` in HTML attributes to reserve layout space. |
| **INP** (Interaction to Next Paint) | **< 80ms** | Hero interactive demo avoids heavy scripts; event listeners run non-blocking microtasks. |

---

## 7. Anti-Spam & Integrity Rules

- **Zero Keyword Stuffing**: Content is written for real human visitors first.
- **Zero Fabricated Social Proof**: No fake customer star ratings, bogus testimonials, or fake live counters.
- **Zero Hidden Text**: All indexable text is visible to sighted visitors and screen readers alike.
