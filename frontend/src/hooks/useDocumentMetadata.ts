import { useEffect } from 'react';

interface MetadataOptions {
  description?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = 'Life RPG — Turn Everyday Tasks Into Epic Progression & Character Growth';
const DEFAULT_DESCRIPTION =
  'Transform daily habits, study, and workouts into a real RPG adventure. Level up attributes, build streaks, earn gold, and unlock gear with verified database persistence.';

/**
 * Hook to manage page title, description, and search engine crawlability.
 * For private / authenticated routes, passing { noindex: true } ensures
 * `<meta name="robots" content="noindex, nofollow">` is set to protect user privacy.
 */
export function useDocumentMetadata(title?: string, options: MetadataOptions = {}) {
  useEffect(() => {
    // 1. Update Document Title
    const previousTitle = document.title;
    document.title = title ? (title.includes('Life RPG') ? title : `${title} | Life RPG`) : DEFAULT_TITLE;

    // 2. Update or Create Meta Description
    let descMeta = document.querySelector('meta[name="description"]');
    const previousDesc = descMeta?.getAttribute('content') ?? null;
    if (options.description) {
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', options.description);
    }

    // 3. Update or Create Meta Robots (Index vs. Noindex)
    let robotsMeta = document.querySelector('meta[name="robots"]');
    const previousRobots = robotsMeta?.getAttribute('content') ?? null;

    if (options.noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta) {
      robotsMeta.setAttribute('content', 'index, follow');
    }

    // Cleanup on unmount or route change
    return () => {
      document.title = previousTitle || DEFAULT_TITLE;
      if (descMeta) {
        descMeta.setAttribute('content', previousDesc || DEFAULT_DESCRIPTION);
      }
      if (robotsMeta) {
        if (previousRobots !== null) {
          robotsMeta.setAttribute('content', previousRobots);
        } else {
          robotsMeta.setAttribute('content', 'index, follow');
        }
      }
    };
  }, [title, options.description, options.noindex]);
}
