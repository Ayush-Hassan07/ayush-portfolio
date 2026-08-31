type AnalyticsEventType =
  | 'PAGE_VIEW'
  | 'PROJECT_VIEW'
  | 'RESEARCH_VIEW'
  | 'CTA_CLICK'
  | 'SOCIAL_CLICK'
  | 'CONTACT_CLICK'
  | 'SCROLL_DEPTH'
  | 'ENGAGEMENT';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

type AnalyticsPayload = {
  eventType: AnalyticsEventType;
  path: string;
  entityType?: string;
  entityId?: string;
  entitySlug?: string;
  action?: string;
  label?: string;
  value?: number;
  metadata?: Record<string, string | number | boolean>;
};

const VISITOR_KEY = 'ahr_visitor_key';
const SESSION_KEY = 'ahr_session_key';

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function getVisitorKey() {
  let visitorKey = localStorage.getItem(VISITOR_KEY);

  if (!visitorKey) {
    visitorKey = createId('visitor');
    localStorage.setItem(VISITOR_KEY, visitorKey);
  }

  return visitorKey;
}

function getSessionKey() {
  let sessionKey = sessionStorage.getItem(SESSION_KEY);

  if (!sessionKey) {
    sessionKey = createId('session');
    sessionStorage.setItem(SESSION_KEY, sessionKey);
  }

  return sessionKey;
}

function getDeviceType(): DeviceType {
  if (window.innerWidth <= 700) {
    return 'mobile';
  }

  if (window.innerWidth <= 1100) {
    return 'tablet';
  }

  return 'desktop';
}

function getReferrerDomain() {
  if (!document.referrer) {
    return undefined;
  }

  try {
    return new URL(document.referrer).hostname;
  } catch {
    return undefined;
  }
}

export async function trackAnalyticsEvent(
  payload: AnalyticsPayload,
) {
  if (typeof window === 'undefined') {
    return;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return;
  }

  const body = {
    visitorKey: getVisitorKey(),
    sessionKey: getSessionKey(),
    eventType: payload.eventType,
    path: payload.path,
    entityType: payload.entityType,
    entityId: payload.entityId,
    entitySlug: payload.entitySlug,
    action: payload.action,
    label: payload.label,
    value: payload.value,
    referrer: document.referrer || undefined,
    referrerDomain: getReferrerDomain(),
    deviceType: getDeviceType(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    metadata: payload.metadata,
  };

  try {
    const response = await fetch(
      `${apiUrl}/analytics/event`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        keepalive: true,
      },
    );

    if (
      !response.ok &&
      process.env.NODE_ENV === 'development'
    ) {
      console.error(
        '[Analytics] Request failed:',
        response.status,
        await response.text(),
        body,
      );
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '[Analytics] Request error:',
        error,
        body,
      );
    }

    // Analytics must never break the public portfolio.
  }
}