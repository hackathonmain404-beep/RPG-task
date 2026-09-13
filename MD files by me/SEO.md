# SEO Specification — Competitive Strategy

## Why this matters

SEO and performance are explicitly named judging pillars. The judges will evaluate semantic HTML, optimized assets, metadata, and search visibility. fileciteturn2file0L67-L80

The authenticated app is not the main SEO target.

The **public landing page is**.

## SEO architecture

Create a public `/` page that can be crawled without authentication.

Primary purpose:
- explain Life RPG
- rank for relevant searches
- demonstrate the product
- convert visitors to signup

Authenticated dashboard routes should generally be `noindex`.

## Target intent

Use natural, useful content around:
- gamified productivity
- RPG productivity app
- habit and task gamification
- productivity leveling system
- streak-based productivity
- gamified to-do app
- life RPG productivity

Do not keyword-stuff.

## Title

Make it concise, descriptive and product-specific.

Example:

`Life RPG — Turn Your Tasks Into XP, Levels & Real-World Progress`

## Meta description

Explain what the product does and include real benefits.

Example:
`Turn everyday tasks into quests. Earn XP, build streaks, level character attributes, and unlock rewards in a persistent RPG productivity system.`

## Semantic structure

Public page:

```html
<header>
<nav>
<main>
  <section>
  <section>
  <section>
<footer>
```

Use meaningful H1/H2/H3 hierarchy.

## Public content strategy

Do not make the landing page only a hero + screenshots.

Build useful, indexable sections:

1. Hero
2. How Life RPG works
3. XP & leveling explanation
4. Streak system
5. Character attributes
6. Rewards/economy
7. Example quest system
8. FAQ
9. Final CTA

The content must be genuine and visible.

## Structured data

Where appropriate, add:
- `WebSite`
- `SoftwareApplication`
- `FAQPage` only when the FAQ is actually present and eligible
- `Organization` only if accurate

Do not add fake reviews, ratings or fabricated structured data.

## Social metadata

Include:
- Open Graph title
- Open Graph description
- Open Graph image
- Twitter/X equivalent metadata

## Canonical

Provide a canonical URL for the public landing page.

## Sitemap

Include public indexable routes only.

Do not submit authenticated dashboard URLs to sitemap.

## Robots

Allow:
- homepage
- public product/help content

Disallow/noindex:
- private dashboards
- account pages
- internal API routes

## Internal linking

Use visible links between public sections such as:
- Product
- Features
- How It Works
- FAQ
- Sign Up

## Image SEO

- descriptive filenames
- width/height
- modern formats where useful
- lazy loading for below-the-fold media
- meaningful alt text

## Core Web Vitals mindset

Optimize:
- LCP: lightweight hero
- CLS: reserve media dimensions
- INP: keep interactions responsive

Avoid shipping huge animation libraries for tiny effects.

## SEO verification

Run:
- production Lighthouse
- search engine crawl check
- source inspection
- canonical check
- robots check
- sitemap check
- mobile rendering check

## Competitive SEO rule

Do not try to "game Google."

Make a fast page with original, genuinely useful content that answers the user's search intent.
