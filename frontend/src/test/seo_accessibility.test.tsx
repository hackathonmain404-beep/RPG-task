import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { useDocumentMetadata } from '../hooks/useDocumentMetadata';
import { LevelUpOverlay } from '../components/common/LevelUpOverlay';
import { RouteLoadingFallback } from '../components/common/RouteLoadingFallback';
import { RewardToast } from '../components/common/RewardToast';

describe('Phase 7 — SEO Specifications & Metadata Audit', () => {
  const publicDir = resolve(__dirname, '../../public');
  const indexHtmlPath = resolve(__dirname, '../../index.html');

  it('1. verifies robots.txt allows public pages and disallows private /app/ routes', () => {
    const robotsPath = resolve(publicDir, 'robots.txt');
    expect(existsSync(robotsPath)).toBe(true);

    const robotsContent = readFileSync(robotsPath, 'utf-8');
    expect(robotsContent).toContain('User-agent: *');
    expect(robotsContent).toContain('Allow: /');
    expect(robotsContent).toContain('Allow: /login');
    expect(robotsContent).toContain('Allow: /register');
    expect(robotsContent).toContain('Disallow: /app/');
    expect(robotsContent).toContain('Disallow: /api/');
    expect(robotsContent).toContain('Sitemap: https://liferpg.app/sitemap.xml');
  });

  it('2. verifies sitemap.xml declares only legitimate public indexable URLs', () => {
    const sitemapPath = resolve(publicDir, 'sitemap.xml');
    expect(existsSync(sitemapPath)).toBe(true);

    const sitemapContent = readFileSync(sitemapPath, 'utf-8');
    expect(sitemapContent).toContain('<loc>https://liferpg.app/</loc>');
    expect(sitemapContent).toContain('<loc>https://liferpg.app/login</loc>');
    expect(sitemapContent).toContain('<loc>https://liferpg.app/register</loc>');
    // Ensure no private /app/ or /api/ URLs in sitemap
    expect(sitemapContent).not.toContain('/app/');
    expect(sitemapContent).not.toContain('/api/');
  });

  it('3. verifies og-image.webp social preview card exists', () => {
    const ogImagePath = resolve(publicDir, 'og-image.webp');
    expect(existsSync(ogImagePath)).toBe(true);
  });

  it('4. verifies index.html contains canonical URL, Open Graph dimensions, and JSON-LD structured data', () => {
    const htmlContent = readFileSync(indexHtmlPath, 'utf-8');

    // Canonical link
    expect(htmlContent).toContain('<link rel="canonical" href="https://liferpg.app/" />');

    // Open Graph dimensions and alt
    expect(htmlContent).toContain('<meta property="og:image:width" content="1200" />');
    expect(htmlContent).toContain('<meta property="og:image:height" content="630" />');
    expect(htmlContent).toContain('og:image:alt');

    // Structured Data JSON-LD
    expect(htmlContent).toContain('"@type": "SoftwareApplication"');
    expect(htmlContent).toContain('"@type": "WebSite"');
    expect(htmlContent).toContain('"@type": "FAQPage"');
  });

  it('5. dynamically injects <meta name="robots" content="noindex, nofollow"> for authenticated views', () => {
    const { unmount } = renderHook(() =>
      useDocumentMetadata('Command Citadel', { noindex: true, description: 'Private adventurer portal' })
    );

    expect(document.title).toMatch(/Command Citadel \| (Life RPG|Achiever)/);
    const robotsMeta = document.querySelector('meta[name="robots"]');
    expect(robotsMeta).not.toBeNull();
    expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow');

    unmount();
    // After unmounting, robots should reset
    const afterRobots = document.querySelector('meta[name="robots"]');
    expect(afterRobots?.getAttribute('content')).toBe('index, follow');
  });
});

describe('Phase 7 — Accessibility & WCAG 2.1 AA Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('6. dismisses LevelUpOverlay celebration when Escape key is pressed', () => {
    const onDismiss = vi.fn();
    render(
      <LevelUpOverlay
        event={{ levelBefore: 4, levelAfter: 5 }}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('7. provides accessible screen reader feedback via live regions in RewardToast', () => {
    const onDismiss = vi.fn();
    render(
      <RewardToast
        reward={{
          taskId: 'task_1',
          xp: 80,
          gold: 24,
          attribute: { key: 'intellect', amount: 2 },
        }}
        onDismiss={onDismiss}
      />
    );

    const toastStatus = screen.getByRole('status');
    expect(toastStatus).toBeInTheDocument();
    expect(toastStatus).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('+80 XP')).toBeInTheDocument();
    expect(screen.getByText('+24 Gold')).toBeInTheDocument();
  });

  it('8. renders accessible RouteLoadingFallback with role status and aria-label', () => {
    render(<RouteLoadingFallback />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-label', 'Loading Citadel page content');
  });
});
