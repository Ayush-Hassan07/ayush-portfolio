'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { trackAnalyticsEvent } from '@/lib/analytics';

const ENGAGEMENT_INTERVAL_MS = 15000;
const PAGE_VIEW_DEDUPE_MS = 1500;

const recentPageViews = new Map<string, number>();
const recentEntityViews = new Map<string, number>();

function shouldTrackPageView(path: string) {
  const now = Date.now();
  const lastTrackedAt = recentPageViews.get(path);

  if (
    lastTrackedAt !== undefined &&
    now - lastTrackedAt < PAGE_VIEW_DEDUPE_MS
  ) {
    return false;
  }

  recentPageViews.set(path, now);

  for (const [storedPath, trackedAt] of recentPageViews) {
    if (now - trackedAt > 10000) {
      recentPageViews.delete(storedPath);
    }
  }

  return true;
}

function shouldTrackEntityView(key: string) {
  const now = Date.now();
  const lastTrackedAt = recentEntityViews.get(key);

  if (
    lastTrackedAt !== undefined &&
    now - lastTrackedAt < PAGE_VIEW_DEDUPE_MS
  ) {
    return false;
  }

  recentEntityViews.set(key, now);

  for (const [storedKey, trackedAt] of recentEntityViews) {
    if (now - trackedAt > 10000) {
      recentEntityViews.delete(storedKey);
    }
  }

  return true;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  const lastEngagementAt = useRef(Date.now());

  const reachedScrollDepths = useRef<Set<number>>(
    new Set(),
  );

  /*
   * PAGE VIEW
   */
  useEffect(() => {
    if (!shouldTrackPageView(pathname)) {
      return;
    }

    void trackAnalyticsEvent({
      eventType: 'PAGE_VIEW',
      path: pathname,
    });
  }, [pathname]);

  /*
   * PROJECT / RESEARCH VIEW
   */
  useEffect(() => {
    const projectMatch = pathname.match(
      /^\/projects\/([^/]+)$/,
    );

    if (projectMatch) {
      const slug = decodeURIComponent(projectMatch[1]);
      const key = `PROJECT_VIEW:${pathname}`;

      if (shouldTrackEntityView(key)) {
        void trackAnalyticsEvent({
          eventType: 'PROJECT_VIEW',
          path: pathname,
          entityType: 'project',
          entitySlug: slug,
          label: slug,
        });
      }

      return;
    }

    if (pathname === '/research') {
      const key = `RESEARCH_VIEW:${pathname}`;

      if (shouldTrackEntityView(key)) {
        void trackAnalyticsEvent({
          eventType: 'RESEARCH_VIEW',
          path: pathname,
          entityType: 'research',
          action: 'archive_view',
          label: 'Research Archive',
        });
      }
    }
  }, [pathname]);

  /*
   * ENGAGEMENT
   */
  useEffect(() => {
    lastEngagementAt.current = Date.now();

    const interval = window.setInterval(() => {
      const now = Date.now();

      if (document.visibilityState !== 'visible') {
        lastEngagementAt.current = now;
        return;
      }

      const seconds = Math.floor(
        (now - lastEngagementAt.current) / 1000,
      );

      lastEngagementAt.current = now;

      if (seconds <= 0) {
        return;
      }

      void trackAnalyticsEvent({
        eventType: 'ENGAGEMENT',
        path: window.location.pathname,
        value: Math.min(seconds, 60),
      });
    }, ENGAGEMENT_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /*
   * SCROLL DEPTH
   */
  useEffect(() => {
    reachedScrollDepths.current.clear();

    const handleScroll = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      if (scrollableHeight <= 0) {
        return;
      }

      const percentage = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (window.scrollY / scrollableHeight) * 100,
          ),
        ),
      );

      for (const milestone of [25, 50, 75, 100]) {
        if (
          percentage >= milestone &&
          !reachedScrollDepths.current.has(milestone)
        ) {
          reachedScrollDepths.current.add(milestone);

          void trackAnalyticsEvent({
            eventType: 'SCROLL_DEPTH',
            path: pathname,
            value: milestone,
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll,
      );
    };
  }, [pathname]);

  return null;
}