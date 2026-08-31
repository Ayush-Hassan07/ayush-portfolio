'use client';

import {
  AnchorHTMLAttributes,
  MouseEvent,
  ReactNode,
} from 'react';

import { trackAnalyticsEvent } from '@/lib/analytics';

type TrackableEventType =
  | 'CTA_CLICK'
  | 'SOCIAL_CLICK'
  | 'CONTACT_CLICK';

type TrackedLinkProps =
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    eventType: TrackableEventType;
    action: string;
    label: string;
    entityType?: string;
    entityId?: string;
    entitySlug?: string;
  };

export default function TrackedLink({
  children,
  eventType,
  action,
  label,
  entityType,
  entityId,
  entitySlug,
  onClick,
  ...anchorProps
}: TrackedLinkProps) {
  const handleClick = (
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    void trackAnalyticsEvent({
      eventType,
      path: window.location.pathname,
      action,
      label,
      entityType,
      entityId,
      entitySlug,
    });
  };

  return (
    <a
      {...anchorProps}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}