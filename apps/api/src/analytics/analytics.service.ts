import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import {
  ANALYTICS_EVENT_TYPES,
  AnalyticsEventInput,
  DeviceType,
} from './analytics.types';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordEvent(input: AnalyticsEventInput) {
    const data = this.validateAndNormalize(input);

    return this.prisma.$transaction(async (tx) => {
      let session = await tx.analytics_session.findUnique({
        where: {
          session_key: data.sessionKey,
        },
      });

      if (!session) {
        const previousSession =
          await tx.analytics_session.findFirst({
            where: {
              visitor_key: data.visitorKey,
            },
            select: {
              id: true,
            },
          });

        session = await tx.analytics_session.create({
          data: {
            session_key: data.sessionKey,
            visitor_key: data.visitorKey,
            entry_path: data.path,
            exit_path: data.path,
            referrer: data.referrer,
            referrer_domain: data.referrerDomain,
            device_type: data.deviceType,
            screen_width: data.screenWidth,
            screen_height: data.screenHeight,
            language: data.language,
            is_returning: Boolean(previousSession),
            event_count: 0,
            duration_seconds: 0,
          },
        });
      } else if (
        session.visitor_key !== data.visitorKey
      ) {
        throw new BadRequestException(
          'Session does not belong to this visitor.',
        );
      }

      await tx.analytics_event.create({
        data: {
          session_id: session.id,
          event_type: data.eventType,
          path: data.path,
          entity_type: data.entityType,
          entity_id: data.entityId,
          entity_slug: data.entitySlug,
          action: data.action,
          label: data.label,
          value: data.value,
          metadata: data.metadata,
        },
      });

      const durationIncrement =
        data.eventType === 'ENGAGEMENT'
          ? Math.max(0, data.value ?? 0)
          : 0;

      const now = new Date();

      await tx.analytics_session.update({
        where: {
          id: session.id,
        },
        data: {
          last_seen_at: now,
          updated_at: now,
          exit_path: data.path,
          event_count: {
            increment: 1,
          },
          ...(durationIncrement > 0
            ? {
                duration_seconds: {
                  increment: durationIncrement,
                },
              }
            : {}),
        },
      });

      return {
        accepted: true,
      };
    });
  }

  async getStatistics(
    range?: string,
    month?: string,
    year?: string,
    project?: string,
    research?: string,
  ) {
    const {
      normalizedRange,
      startDate,
      endDate,
    } = this.resolveStatisticsRange(range, month, year);

    const sessionWhere = startDate
      ? {
          started_at: {
            gte: startDate,
            ...(endDate ? { lt: endDate } : {}),
          },
        }
      : {};

    const eventWhere = startDate
      ? {
          occurred_at: {
            gte: startDate,
            ...(endDate ? { lt: endDate } : {}),
          },
        }
      : {};

    const [
      sessions,
      uniqueVisitors,
      pageViews,
      projectViews,
      researchViews,
      totalEvents,
      returningSessions,
      engagement,
      devices,
      referrers,
      pageGroups,
      projectGroups,
      projectCtaGroups,
      researchCtaGroups,
      actionGroups,
      socialGroups,
      contactGroups,
    ] = await Promise.all([
      this.prisma.analytics_session.count({
        where: sessionWhere,
      }),

      this.prisma.analytics_session.groupBy({
        by: ['visitor_key'],
        where: sessionWhere,
      }),

      this.prisma.analytics_event.count({
        where: {
          ...eventWhere,
          event_type: 'PAGE_VIEW',
        },
      }),

      this.prisma.analytics_event.count({
        where: {
          ...eventWhere,
          event_type: 'PROJECT_VIEW',
        },
      }),

      this.prisma.analytics_event.count({
        where: {
          ...eventWhere,
          event_type: 'RESEARCH_VIEW',
        },
      }),

      this.prisma.analytics_event.count({
        where: eventWhere,
      }),

      this.prisma.analytics_session.count({
        where: {
          ...sessionWhere,
          is_returning: true,
        },
      }),

      this.prisma.analytics_session.aggregate({
        where: sessionWhere,
        _sum: {
          duration_seconds: true,
        },
        _avg: {
          duration_seconds: true,
        },
      }),

      this.prisma.analytics_session.groupBy({
        by: ['device_type'],
        where: sessionWhere,
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            device_type: 'desc',
          },
        },
      }),

      this.prisma.analytics_session.groupBy({
        by: ['referrer_domain'],
        where: sessionWhere,
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            referrer_domain: 'desc',
          },
        },
        take: 10,
      }),

      this.prisma.analytics_event.groupBy({
        by: ['path'],
        where: {
          ...eventWhere,
          event_type: 'PAGE_VIEW',
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            path: 'desc',
          },
        },
        take: 10,
      }),

      this.prisma.analytics_event.groupBy({
        by: ['entity_slug'],
        where: {
          ...eventWhere,
          event_type: 'PROJECT_VIEW',
          entity_slug: {
            not: null,
          },
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            entity_slug: 'desc',
          },
        },
        take: 10,
      }),

      this.prisma.analytics_event.groupBy({
        by: [
          'entity_id',
          'entity_slug',
          'label',
          'action',
        ],
        where: {
          ...eventWhere,
          event_type: 'CTA_CLICK',
          entity_type: 'project',
          ...(project ? { entity_id: project } : {}),
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            entity_id: 'desc',
          },
        },
      }),

      this.prisma.analytics_event.groupBy({
        by: [
          'entity_id',
          'label',
          'action',
        ],
        where: {
          ...eventWhere,
          event_type: 'CTA_CLICK',
          entity_type: 'research',
          ...(research ? { entity_id: research } : {}),
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            entity_id: 'desc',
          },
        },
      }),

      this.prisma.analytics_event.groupBy({
        by: ['action'],
        where: {
          ...eventWhere,
          event_type: 'CTA_CLICK',
          action: {
            not: null,
          },
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            action: 'desc',
          },
        },
      }),

      this.prisma.analytics_event.groupBy({
        by: ['action'],
        where: {
          ...eventWhere,
          event_type: 'SOCIAL_CLICK',
          action: {
            not: null,
          },
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            action: 'desc',
          },
        },
      }),

      this.prisma.analytics_event.groupBy({
        by: ['action'],
        where: {
          ...eventWhere,
          event_type: 'CONTACT_CLICK',
          action: {
            not: null,
          },
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            action: 'desc',
          },
        },
      }),
    ]);

    const [projectOptions, researchOptions] =
      await Promise.all([
        this.prisma.project.findMany({
          select: { id: true, title: true, slug: true },
          orderBy: { sort_order: 'asc' },
        }),
        this.prisma.publication.findMany({
          select: { id: true, title: true },
          orderBy: { publication_date: 'desc' },
        }),
      ]);

    const scrollDepth =
      await this.getScrollDepthStatistics(
        startDate,
      );

    const trend = await this.getTrafficTrend(startDate);

    return {
      range: normalizedRange,
      generatedAt: new Date().toISOString(),

      overview: {
        visitors: uniqueVisitors.length,
        sessions,
        pageViews,
        projectViews,
        researchViews,
        totalEvents,
        returningSessions,

        returningSessionRate:
          sessions > 0
            ? Number(
                (
                  (returningSessions /
                    sessions) *
                  100
                ).toFixed(1),
              )
            : 0,

        totalEngagementSeconds:
          engagement._sum
            .duration_seconds ?? 0,

        averageEngagementSeconds:
          Math.round(
            engagement._avg
              .duration_seconds ?? 0,
          ),
      },

      pages: pageGroups.map((item) => ({
        path: item.path,
        views: item._count._all,
      })),

      projects: {
        options: projectOptions,
        views: projectGroups.map(
          (item) => ({
            slug: item.entity_slug,
            views: item._count._all,
          }),
        ),

        actions: projectCtaGroups.map(
          (item) => ({
            entityId: item.entity_id,
            slug: item.entity_slug,
            title: item.label,
            action: item.action,
            clicks: item._count._all,
          }),
        ),
      },

      research: {
        options: researchOptions,
        archiveViews: researchViews,

        actions: researchCtaGroups.map(
          (item) => ({
            entityId: item.entity_id,
            title: item.label,
            action: item.action,
            clicks: item._count._all,
          }),
        ),
      },

      actions: actionGroups.map(
        (item) => ({
          action: item.action,
          clicks: item._count._all,
        }),
      ),

      social: socialGroups.map(
        (item) => ({
          action: item.action,
          clicks: item._count._all,
        }),
      ),

      contact: contactGroups.map(
        (item) => ({
          action: item.action,
          clicks: item._count._all,
        }),
      ),

      devices: devices.map(
        (item) => ({
          device:
            item.device_type ??
            'unknown',
          sessions:
            item._count._all,
        }),
      ),

      referrers: referrers.map(
        (item) => ({
          domain:
            item.referrer_domain ??
            'Direct',
          sessions:
            item._count._all,
        }),
      ),

      scrollDepth,
      trend,
    };
  }

  private resolveStatisticsRange(
    range?: string,
    month?: string,
    year?: string,
  ) {
    const now = new Date();

    if (range === '1m' && month && year) {
      const selectedMonth = Number(month);
      const selectedYear = Number(year);
      if (Number.isInteger(selectedMonth) && selectedMonth >= 1 && selectedMonth <= 12 && Number.isInteger(selectedYear) && selectedYear >= 2000 && selectedYear <= 2100) {
        return {
          normalizedRange: '1m',
          startDate: new Date(Date.UTC(selectedYear, selectedMonth - 1, 1)),
          endDate: new Date(Date.UTC(selectedYear, selectedMonth, 1)),
        };
      }
    }

    if (range === '1y' && year) {
      const selectedYear = Number(year);
      if (Number.isInteger(selectedYear) && selectedYear >= 2000 && selectedYear <= 2100) {
        return {
          normalizedRange: '1y',
          startDate: new Date(Date.UTC(selectedYear, 0, 1)),
          endDate: new Date(Date.UTC(selectedYear + 1, 0, 1)),
        };
      }
    }

    switch (range) {
      case 'today':
        return {
          normalizedRange: 'today',
          startDate: new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
          ),
        };

      case '7d':
        return {
          normalizedRange: '7d',
          startDate: new Date(
            now.getTime() -
              7 *
                24 *
                60 *
                60 *
                1000,
          ),
        };

      case '90d':
        return {
          normalizedRange: '90d',
          startDate: new Date(
            now.getTime() -
              90 *
                24 *
                60 *
                60 *
                1000,
          ),
        };

      case '1m':
        return {
          normalizedRange: '1m',
          startDate: new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000,
          ),
        };

      case '1y':
        return {
          normalizedRange: '1y',
          startDate: new Date(
            now.getTime() - 365 * 24 * 60 * 60 * 1000,
          ),
        };

      case 'all':
        return {
          normalizedRange: 'all',
          startDate: undefined,
        };

      case '30d':
      default:
        return {
          normalizedRange: '30d',
          startDate: new Date(
            now.getTime() -
              30 *
                24 *
                60 *
                60 *
                1000,
          ),
        };
    }
  }

  private async getScrollDepthStatistics(
    startDate?: Date,
  ) {
    const events =
      await this.prisma.analytics_event.findMany({
        where: {
          event_type: 'SCROLL_DEPTH',

          ...(startDate
            ? {
                occurred_at: {
                  gte: startDate,
                },
              }
            : {}),
        },

        select: {
          session_id: true,
          path: true,
          value: true,
        },
      });

    const maximums = new Map<
      string,
      {
        path: string;
        value: number;
      }
    >();

    for (const event of events) {
      if (event.value === null) {
        continue;
      }

      const key =
        `${event.session_id}:${event.path}`;

      const previous =
        maximums.get(key);

      if (
        !previous ||
        event.value > previous.value
      ) {
        maximums.set(key, {
          path: event.path,
          value: event.value,
        });
      }
    }

    const distribution = {
      reached25: 0,
      reached50: 0,
      reached75: 0,
      reached100: 0,
    };

    let totalDepth = 0;

    for (const item of maximums.values()) {
      totalDepth += item.value;

      if (item.value >= 25) {
        distribution.reached25 += 1;
      }

      if (item.value >= 50) {
        distribution.reached50 += 1;
      }

      if (item.value >= 75) {
        distribution.reached75 += 1;
      }

      if (item.value >= 100) {
        distribution.reached100 += 1;
      }
    }

    return {
      trackedPageVisits: maximums.size,

      averageDepth:
        maximums.size > 0
          ? Number(
              (
                totalDepth /
                maximums.size
              ).toFixed(1),
            )
          : 0,

      ...distribution,
    };
  }

  private async getTrafficTrend(startDate?: Date) {
    const now = new Date();
    const [sessions, pageViews] = await Promise.all([
      this.prisma.analytics_session.findMany({
        where: startDate ? { started_at: { gte: startDate } } : {},
        select: { visitor_key: true, started_at: true },
        orderBy: { started_at: 'asc' },
      }),
      this.prisma.analytics_event.findMany({
        where: {
          event_type: 'PAGE_VIEW',
          ...(startDate ? { occurred_at: { gte: startDate } } : {}),
        },
        select: { occurred_at: true },
        orderBy: { occurred_at: 'asc' },
      }),
    ]);

    const availableDates: Date[] = [];
    if (sessions.length) availableDates.push(sessions[0].started_at);
    if (pageViews.length) availableDates.push(pageViews[0].occurred_at);

    const effectiveStart = startDate ?? (availableDates.length
      ? new Date(Math.min(...availableDates.map((date) => date.getTime())))
      : now);
    const toDateKey = (date: Date) => date.toISOString().slice(0, 10);
    const buckets = new Map<string, { date: string; visitors: Set<string>; sessions: number; pageViews: number }>();
    const cursor = new Date(Date.UTC(effectiveStart.getUTCFullYear(), effectiveStart.getUTCMonth(), effectiveStart.getUTCDate()));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    while (cursor.getTime() <= end.getTime()) {
      const key = toDateKey(cursor);
      buckets.set(key, { date: key, visitors: new Set<string>(), sessions: 0, pageViews: 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    for (const session of sessions) {
      const bucket = buckets.get(toDateKey(session.started_at));
      if (!bucket) continue;
      bucket.sessions += 1;
      bucket.visitors.add(session.visitor_key);
    }

    for (const pageView of pageViews) {
      const bucket = buckets.get(toDateKey(pageView.occurred_at));
      if (bucket) bucket.pageViews += 1;
    }

    return Array.from(buckets.values()).map((bucket) => ({
      date: bucket.date,
      visitors: bucket.visitors.size,
      sessions: bucket.sessions,
      pageViews: bucket.pageViews,
    }));
  }

  private validateAndNormalize(
    input: AnalyticsEventInput,
  ) {
    if (
      !input ||
      typeof input !== 'object'
    ) {
      throw new BadRequestException(
        'Invalid analytics payload.',
      );
    }

    const visitorKey =
      this.requiredString(
        input.visitorKey,
        'visitorKey',
        100,
      );

    const sessionKey =
      this.requiredString(
        input.sessionKey,
        'sessionKey',
        100,
      );

    if (
      !ANALYTICS_EVENT_TYPES.includes(
        input.eventType,
      )
    ) {
      throw new BadRequestException(
        'Invalid analytics event type.',
      );
    }

    const path =
      this.requiredString(
        input.path,
        'path',
        500,
      );

    if (!path.startsWith('/')) {
      throw new BadRequestException(
        'Analytics path must be a relative application path.',
      );
    }

    const value =
      this.optionalInteger(
        input.value,
        'value',
        0,
        86400,
      );

    if (
      input.eventType ===
        'SCROLL_DEPTH' &&
      value !== undefined &&
      ![25, 50, 75, 100].includes(
        value,
      )
    ) {
      throw new BadRequestException(
        'Invalid scroll depth value.',
      );
    }

    return {
      visitorKey,
      sessionKey,
      eventType: input.eventType,
      path,
      entityType:
        this.optionalString(
          input.entityType,
          50,
        ),
      entityId:
        this.optionalString(
          input.entityId,
          150,
        ),
      entitySlug:
        this.optionalString(
          input.entitySlug,
          250,
        ),
      action:
        this.optionalString(
          input.action,
          100,
        ),
      label:
        this.optionalString(
          input.label,
          250,
        ),
      value,
      referrer:
        this.optionalString(
          input.referrer,
          2000,
        ),
      referrerDomain:
        this.optionalString(
          input.referrerDomain,
          255,
        ),
      deviceType:
        this.optionalDeviceType(
          input.deviceType,
        ),
      screenWidth:
        this.optionalInteger(
          input.screenWidth,
          'screenWidth',
          1,
          20000,
        ),
      screenHeight:
        this.optionalInteger(
          input.screenHeight,
          'screenHeight',
          1,
          20000,
        ),
      language:
        this.optionalString(
          input.language,
          30,
        ),
      metadata:
        this.sanitizeMetadata(
          input.metadata,
        ),
    };
  }

  private requiredString(
    value: unknown,
    field: string,
    maxLength: number,
  ) {
    if (
      typeof value !== 'string' ||
      !value.trim()
    ) {
      throw new BadRequestException(
        `${field} is required.`,
      );
    }

    return value
      .trim()
      .slice(0, maxLength);
  }

  private optionalString(
    value: unknown,
    maxLength: number,
  ) {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized =
      value.trim();

    return normalized
      ? normalized.slice(
          0,
          maxLength,
        )
      : undefined;
  }

  private optionalInteger(
    value: unknown,
    field: string,
    min: number,
    max: number,
  ) {
    if (
      value === undefined ||
      value === null
    ) {
      return undefined;
    }

    if (
      typeof value !== 'number' ||
      !Number.isInteger(value) ||
      value < min ||
      value > max
    ) {
      throw new BadRequestException(
        `${field} must be an integer between ${min} and ${max}.`,
      );
    }

    return value;
  }

  private optionalDeviceType(
    value: unknown,
  ): DeviceType | undefined {
    if (
      value === undefined ||
      value === null
    ) {
      return undefined;
    }

    if (
      value !== 'desktop' &&
      value !== 'tablet' &&
      value !== 'mobile'
    ) {
      throw new BadRequestException(
        'Invalid device type.',
      );
    }

    return value;
  }

  private sanitizeMetadata(
    metadata: unknown,
  ):
    | Record<
        string,
        string | number | boolean
      >
    | undefined {
    if (
      metadata === undefined ||
      metadata === null
    ) {
      return undefined;
    }

    if (
      typeof metadata !== 'object' ||
      Array.isArray(metadata)
    ) {
      throw new BadRequestException(
        'metadata must be an object.',
      );
    }

    const safeMetadata: Record<
      string,
      string | number | boolean
    > = {};

    for (const [
      key,
      value,
    ] of Object.entries(
      metadata as Record<
        string,
        unknown
      >,
    ).slice(0, 10)) {
      const safeKey = key
        .trim()
        .slice(0, 50);

      if (!safeKey) {
        continue;
      }

      if (
        typeof value === 'string'
      ) {
        safeMetadata[safeKey] =
          value.slice(0, 250);
      } else if (
        typeof value === 'number' &&
        Number.isFinite(value)
      ) {
        safeMetadata[safeKey] =
          value;
      } else if (
        typeof value === 'boolean'
      ) {
        safeMetadata[safeKey] =
          value;
      }
    }

    return Object.keys(
      safeMetadata,
    ).length
      ? safeMetadata
      : undefined;
  }
}
