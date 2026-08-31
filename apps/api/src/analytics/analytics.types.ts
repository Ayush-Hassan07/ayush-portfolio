export const ANALYTICS_EVENT_TYPES = [
  'PAGE_VIEW',
  'PROJECT_VIEW',
  'RESEARCH_VIEW',
  'CTA_CLICK',
  'SOCIAL_CLICK',
  'CONTACT_CLICK',
  'SCROLL_DEPTH',
  'ENGAGEMENT',
] as const;

export type AnalyticsEventType =
  (typeof ANALYTICS_EVENT_TYPES)[number];

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export type AnalyticsEventInput = {
  visitorKey: string;
  sessionKey: string;
  eventType: AnalyticsEventType;
  path: string;
  entityType?: string;
  entityId?: string;
  entitySlug?: string;
  action?: string;
  label?: string;
  value?: number;
  referrer?: string;
  referrerDomain?: string;
  deviceType?: DeviceType;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  metadata?: Record<string, unknown>;
};
