"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import ThemedSelect from "./ThemedSelect";

type StatisticsRange =
  | "today"
  | "7d"
  | "30d"
  | "90d"
  | "1m"
  | "1y"
  | "all";

type Overview = {
  visitors: number;
  sessions: number;
  pageViews: number;
  projectViews: number;
  researchViews: number;
  totalEvents: number;
  returningSessions: number;
  returningSessionRate: number;
  totalEngagementSeconds: number;
  averageEngagementSeconds: number;
};

type PageStatistic = {
  path: string;
  views: number;
};

type ProjectViewStatistic = {
  slug: string | null;
  views: number;
};

type ProjectActionStatistic = {
  entityId: string | null;
  slug: string | null;
  title: string | null;
  action: string | null;
  clicks: number;
};

type ResearchActionStatistic = {
  entityId: string | null;
  title: string | null;
  action: string | null;
  clicks: number;
};

type ActionStatistic = {
  action: string | null;
  clicks: number;
};

type DeviceStatistic = {
  device: string;
  sessions: number;
};

type ReferrerStatistic = {
  domain: string;
  sessions: number;
};

type ScrollDepthStatistic = {
  trackedPageVisits: number;
  averageDepth: number;
  reached25: number;
  reached50: number;
  reached75: number;
  reached100: number;
};

type TrendStatistic = {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
};

type StatisticsResponse = {
  range: StatisticsRange;
  generatedAt: string;

  overview: Overview;

  pages: PageStatistic[];

  projects: {
    options: { id: string; title: string; slug: string }[];
    views: ProjectViewStatistic[];
    actions: ProjectActionStatistic[];
  };

  research: {
    options: { id: string; title: string }[];
    archiveViews: number;
    actions: ResearchActionStatistic[];
  };

  actions: ActionStatistic[];
  social: ActionStatistic[];
  contact: ActionStatistic[];

  devices: DeviceStatistic[];
  referrers: ReferrerStatistic[];

  scrollDepth: ScrollDepthStatistic;
  trend: TrendStatistic[];
};

const ranges: {
  value: StatisticsRange;
  label: string;
}[] = [
  {
    value: "today",
    label: "Today",
  },
  {
    value: "7d",
    label: "7 Days",
  },
  {
    value: "30d",
    label: "30 Days",
  },
  {
    value: "90d",
    label: "90 Days",
  },
  {
    value: "1m",
    label: "Monthly",
  },
  {
    value: "1y",
    label: "Yearly",
  },
  {
    value: "all",
    label: "All Time",
  },
];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = Array.from({ length: 6 }, (_, index) => String(new Date().getFullYear() - index));

function formatNumber(value: number) {
  return new Intl.NumberFormat(
    "en-US",
  ).format(value);
}

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  const remainingSeconds =
    seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  const remainingMinutes =
    minutes % 60;

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

function formatActionLabel(
  value: string | null,
) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function formatProjectSlug(
  slug: string | null,
) {
  if (!slug) {
    return "Unknown project";
  }

  return slug
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function getMaximum(
  items: {
    views?: number;
    clicks?: number;
    sessions?: number;
  }[],
) {
  return Math.max(
    1,
    ...items.map(
      (item) =>
        item.views ??
        item.clicks ??
        item.sessions ??
        0,
    ),
  );
}

function formatChartDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function buildLinePoints(values: number[], width: number, height: number, maximum: number) {
  if (!values.length) return "";
  if (values.length === 1) {
    const y = height - (values[0] / maximum) * height;
    return `0,${y} ${width},${y}`;
  }
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - (value / maximum) * height;
    return `${x},${y}`;
  }).join(" ");
}

export default function StatisticsPage() {
  const [range, setRange] =
    useState<StatisticsRange>("30d");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [projectFilter, setProjectFilter] = useState("");
  const [researchFilter, setResearchFilter] = useState("");

  const [statistics, setStatistics] =
    useState<StatisticsResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const api =
    process.env.NEXT_PUBLIC_ADMIN_API_URL ??
    "http://localhost:4000";

  const loadStatistics =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${api}/analytics/statistics?range=${range}${range === "1m" ? `&month=${month}&year=${year}` : range === "1y" ? `&year=${year}` : ""}${projectFilter ? `&project=${encodeURIComponent(projectFilter)}` : ""}${researchFilter ? `&research=${encodeURIComponent(researchFilter)}` : ""}`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );

        if (response.status === 401) {
          window.location.replace(
            "/login",
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Statistics request failed with status ${response.status}.`,
          );
        }

        const data =
          (await response.json()) as StatisticsResponse;

        setStatistics(data);
      } catch (requestError) {
        console.error(
          "[Statistics]",
          requestError,
        );

        setError(
          "Statistics could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }, [api, range, month, year, projectFilter, researchFilter]);

  useEffect(() => {
    void loadStatistics();
  }, [loadStatistics]);

  const topPageMaximum = getMaximum(
    statistics?.pages ?? [],
  );

  const topProjectMaximum = getMaximum(
    statistics?.projects.views ?? [],
  );

  const deviceMaximum = getMaximum(
    statistics?.devices ?? [],
  );

  const referrerMaximum = getMaximum(
    statistics?.referrers ?? [],
  );

  const trendMaximum = Math.max(1, ...(statistics?.trend ?? []).flatMap((item) => [item.pageViews, item.sessions, item.visitors]));
  const pageViewPoints = buildLinePoints(statistics?.trend.map((item) => item.pageViews) ?? [], 1000, 250, trendMaximum);
  const sessionPoints = buildLinePoints(statistics?.trend.map((item) => item.sessions) ?? [], 1000, 250, trendMaximum);
  const visitorPoints = buildLinePoints(statistics?.trend.map((item) => item.visitors) ?? [], 1000, 250, trendMaximum);

  return (
    <section className="statistics-shell">
      <section
        className="statistics-range"
        aria-label="Statistics date range"
      >
        <label className="statistics-range-select">
          <span>Range</span>
          <ThemedSelect ariaLabel="Statistics range" value={range} options={ranges} onChange={(value) => setRange(value as StatisticsRange)} />
        </label>

        {(range === "1m" || range === "1y") && (
          <>
            {range === "1m" && <ThemedSelect className="statistics-period-select" ariaLabel="Month" value={month} options={months.map((label, index) => ({ value: String(index + 1), label }))} onChange={setMonth} />}
            <ThemedSelect className="statistics-period-select" ariaLabel="Year" value={year} options={years.map((label) => ({ value: label, label }))} onChange={setYear} />
          </>
        )}

        {ranges.map((item) => (
          <button
            key={item.value}
            type="button"
            className={
              range === item.value
                ? "active"
                : ""
            }
            onClick={() =>
              setRange(item.value)
            }
          >
            {item.label}
          </button>
        ))}

        {/* <button
          className="statistics-refresh"
          type="button"
          onClick={() =>
            void loadStatistics()
          }
          disabled={loading}
        >
          {loading
            ? "Loadingâ€¦"
            : "Refresh"}
        </button> */}
      </section>

      {error && (
        <div className="statistics-error">
          {error}
        </div>
      )}

      {loading && !statistics ? (
        <div className="statistics-loading">
          Reading analyticsâ€¦
        </div>
      ) : statistics ? (
        <>
          <section
            className="statistics-overview"
            aria-label="Analytics overview"
          >
            <article>
              <span>
                Visitors
              </span>

              <strong>
                {formatNumber(
                  statistics.overview
                    .visitors,
                )}
              </strong>

              <small>
                Anonymous visitors
              </small>
            </article>

            <article>
              <span>
                Sessions
              </span>

              <strong>
                {formatNumber(
                  statistics.overview
                    .sessions,
                )}
              </strong>

              <small>
                Browsing sessions
              </small>
            </article>

            <article>
              <span>
                Page views
              </span>

              <strong>
                {formatNumber(
                  statistics.overview
                    .pageViews,
                )}
              </strong>

              <small>
                Public page loads
              </small>
            </article>

            <article>
              <span>
                Avg. engagement
              </span>

              <strong>
                {formatDuration(
                  statistics.overview
                    .averageEngagementSeconds,
                )}
              </strong>

              <small>
                Per session
              </small>
            </article>
          </section>

          <section className="statistics-secondary-metrics">
            <article>
              <span>
                Returning sessions
              </span>

              <strong>
                {
                  statistics.overview
                    .returningSessionRate
                }
                %
              </strong>

              <small>
                {formatNumber(
                  statistics.overview
                    .returningSessions,
                )}{" "}
                returning sessions
              </small>
            </article>

            <article>
              <span>
                Project views
              </span>

              <strong>
                {formatNumber(
                  statistics.overview
                    .projectViews,
                )}
              </strong>

              <small>
                Project detail opens
              </small>
            </article>

            <article>
              <span>
                Research views
              </span>

              <strong>
                {formatNumber(
                  statistics.overview
                    .researchViews,
                )}
              </strong>

              <small>
                Research archive opens
              </small>
            </article>

            <article>
              <span>
                Total engagement
              </span>

              <strong>
                {formatDuration(
                  statistics.overview
                    .totalEngagementSeconds,
                )}
              </strong>

              <small>
                Tracked active time
              </small>
            </article>

            <article>
              <span>
                Total events
              </span>

              <strong>
                {formatNumber(
                  statistics.overview
                    .totalEvents,
                )}
              </strong>

              <small>
                Recorded interactions
              </small>
            </article>
          </section>

          <section className="statistics-traffic">
            <div className="statistics-panel-header">
              <div>
                <p className="admin-kicker">Traffic trend</p>
                <h2>Portfolio activity over time.</h2>
              </div>
              <div className="statistics-chart-legend">
                <span><i className="pageviews" />Page views</span>
                <span><i className="sessions" />Sessions</span>
                <span><i className="visitors" />Visitors</span>
              </div>
            </div>
            {statistics.trend.length ? (
              <>
                <div className="statistics-line-chart">
                  <div className="statistics-y-axis"><span>{trendMaximum}</span><span>{Math.round(trendMaximum / 2)}</span><span>0</span></div>
                  <div className="statistics-chart-stage">
                    <span className="statistics-chart-grid top" /><span className="statistics-chart-grid middle" /><span className="statistics-chart-grid bottom" />
                    <svg viewBox="0 0 1000 250" preserveAspectRatio="none" role="img" aria-label="Traffic trend showing page views, sessions, and visitors">
                      <polyline className="statistics-line pageviews" points={pageViewPoints} />
                      <polyline className="statistics-line sessions" points={sessionPoints} />
                      <polyline className="statistics-line visitors" points={visitorPoints} />
                    </svg>
                  </div>
                </div>
                <div className="statistics-chart-dates">
                  <span>{formatChartDate(statistics.trend[0].date)}</span>
                  {statistics.trend.length > 2 && <span>{formatChartDate(statistics.trend[Math.floor(statistics.trend.length / 2)].date)}</span>}
                  <span>{formatChartDate(statistics.trend[statistics.trend.length - 1].date)}</span>
                </div>
              </>
            ) : <p className="statistics-empty">No traffic data in this range.</p>}
          </section>

          <section className="statistics-grid">
            <article className="statistics-panel">
              <div className="statistics-panel-header">
                <div>
                  <p className="admin-kicker">
                    Navigation
                  </p>

                  <h2>
                    Top pages
                  </h2>
                </div>

                <span>
                  Views
                </span>
              </div>

              <div className="statistics-ranking">
                {statistics.pages.length ? (
                  statistics.pages.map(
                    (item, index) => (
                      <div
                        className="statistics-ranking-row"
                        key={item.path}
                      >
                        <span className="statistics-rank">
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <div className="statistics-ranking-content">
                          <div className="statistics-ranking-copy">
                            <strong>
                              {item.path}
                            </strong>

                            <span>
                              {formatNumber(
                                item.views,
                              )}
                            </span>
                          </div>

                          <div className="statistics-bar">
                            <span
                              style={{
                                width: `${Math.max(
                                  4,
                                  (item.views /
                                    topPageMaximum) *
                                    100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <p className="statistics-empty">
                    No page views in this
                    range.
                  </p>
                )}
              </div>
            </article>

            <article className="statistics-panel">
              <div className="statistics-panel-header">
                <div>
                  <p className="admin-kicker">
                    Systems
                  </p>

                  <h2>
                    Project interest
                  </h2>
                </div>

                <span>
                  Views
                </span>
              </div>

              <div className="statistics-ranking">
                {statistics.projects
                  .views.length ? (
                  statistics.projects.views.map(
                    (item, index) => (
                      <div
                        className="statistics-ranking-row"
                        key={
                          item.slug ??
                          index
                        }
                      >
                        <span className="statistics-rank">
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <div className="statistics-ranking-content">
                          <div className="statistics-ranking-copy">
                            <strong>
                              {formatProjectSlug(
                                item.slug,
                              )}
                            </strong>

                            <span>
                              {formatNumber(
                                item.views,
                              )}
                            </span>
                          </div>

                          <div className="statistics-bar">
                            <span
                              style={{
                                width: `${Math.max(
                                  4,
                                  (item.views /
                                    topProjectMaximum) *
                                    100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <p className="statistics-empty">
                    No project views in
                    this range.
                  </p>
                )}
              </div>
            </article>
          </section>

          <section className="statistics-grid">
            <article className="statistics-panel">
              <div className="statistics-panel-header">
                <div>
                  <p className="admin-kicker">
                    Intent
                  </p>

                  <h2>
                    Project actions
                  </h2>
                  <label className="statistics-inline-filter">
                    <span>Project</span>
                    <ThemedSelect ariaLabel="Project filter" value={projectFilter} options={[{ value: "", label: "All projects" }, ...statistics.projects.options.map((item) => ({ value: item.id, label: item.title }))]} onChange={setProjectFilter} />
                  </label>
                </div>
              </div>

              <div className="statistics-action-list">
                {statistics.projects
                  .actions.length ? (
                  statistics.projects.actions.map(
                    (item, index) => (
                      <div
                        className="statistics-action-row"
                        key={`${item.entityId}-${item.action}-${index}`}
                      >
                        <div>
                          <strong>
                            {item.title ??
                              formatProjectSlug(
                                item.slug,
                              )}
                          </strong>

                          <span>
                            {formatActionLabel(
                              item.action,
                            )}
                          </span>
                        </div>

                        <b>
                          {formatNumber(
                            item.clicks,
                          )}
                        </b>
                      </div>
                    ),
                  )
                ) : (
                  <p className="statistics-empty">
                    No project actions in
                    this range.
                  </p>
                )}
              </div>
            </article>

            <article className="statistics-panel">
              <div className="statistics-panel-header">
                <div>
                  <p className="admin-kicker">
                    Research
                  </p>

                  <h2>
                    Publication intent
                  </h2>
                  <label className="statistics-inline-filter">
                    <span>Research</span>
                    <ThemedSelect ariaLabel="Research filter" value={researchFilter} options={[{ value: "", label: "All research" }, ...statistics.research.options.map((item) => ({ value: item.id, label: item.title }))]} onChange={setResearchFilter} />
                  </label>
                </div>

                <span>
                  {
                    statistics.research
                      .archiveViews
                  }{" "}
                  archive views
                </span>
              </div>

              <div className="statistics-action-list">
                {statistics.research
                  .actions.length ? (
                  statistics.research.actions.map(
                    (item, index) => (
                      <div
                        className="statistics-action-row"
                        key={`${item.entityId}-${item.action}-${index}`}
                      >
                        <div>
                          <strong>
                            {item.title ??
                              "Research record"}
                          </strong>

                          <span>
                            {formatActionLabel(
                              item.action,
                            )}
                          </span>
                        </div>

                        <b>
                          {formatNumber(
                            item.clicks,
                          )}
                        </b>
                      </div>
                    ),
                  )
                ) : (
                  <p className="statistics-empty">
                    No research actions in
                    this range.
                  </p>
                )}
              </div>
            </article>
          </section>

          <section className="statistics-grid">
            <article className="statistics-panel">
              <div className="statistics-panel-header">
                <div>
                  <p className="admin-kicker">
                    Contact
                  </p>

                  <h2>
                    Conversation signals
                  </h2>
                </div>
              </div>

              <div className="statistics-action-list">
                {statistics.contact.length ? (
                  statistics.contact.map(
                    (item, index) => (
                      <div
                        className="statistics-action-row compact"
                        key={`${item.action}-${index}`}
                      >
                        <strong>
                          {formatActionLabel(
                            item.action,
                          )}
                        </strong>

                        <b>
                          {formatNumber(
                            item.clicks,
                          )}
                        </b>
                      </div>
                    ),
                  )
                ) : (
                  <p className="statistics-empty">
                    No contact activity in
                    this range.
                  </p>
                )}
              </div>
            </article>

            <article className="statistics-panel">
              <div className="statistics-panel-header">
                <div>
                  <p className="admin-kicker">
                    External
                  </p>

                  <h2>
                    Social exits
                  </h2>
                </div>
              </div>

              <div className="statistics-action-list">
                {statistics.social.length ? (
                  statistics.social.map(
                    (item, index) => (
                      <div
                        className="statistics-action-row compact"
                        key={`${item.action}-${index}`}
                      >
                        <strong>
                          {formatActionLabel(
                            item.action,
                          )}
                        </strong>

                        <b>
                          {formatNumber(
                            item.clicks,
                          )}
                        </b>
                      </div>
                    ),
                  )
                ) : (
                  <p className="statistics-empty">
                    No social activity in
                    this range.
                  </p>
                )}
              </div>
            </article>
          </section>

          <section className="statistics-grid">
            <article className="statistics-panel">
              <div className="statistics-panel-header">
                <div>
                  <p className="admin-kicker">
                    Audience
                  </p>

                  <h2>
                    Devices
                  </h2>
                </div>
              </div>

              <div className="statistics-ranking">
                {statistics.devices.length ? (
                  statistics.devices.map(
                    (item) => (
                      <div
                        className="statistics-ranking-row no-rank"
                        key={item.device}
                      >
                        <div className="statistics-ranking-content">
                          <div className="statistics-ranking-copy">
                            <strong>
                              {formatActionLabel(
                                item.device,
                              )}
                            </strong>

                            <span>
                              {formatNumber(
                                item.sessions,
                              )}
                            </span>
                          </div>

                          <div className="statistics-bar">
                            <span
                              style={{
                                width: `${Math.max(
                                  4,
                                  (item.sessions /
                                    deviceMaximum) *
                                    100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <p className="statistics-empty">
                    No device data in this
                    range.
                  </p>
                )}
              </div>
            </article>

            <article className="statistics-panel">
              <div className="statistics-panel-header">
                <div>
                  <p className="admin-kicker">
                    Acquisition
                  </p>

                  <h2>
                    Referrers
                  </h2>
                </div>
              </div>

              <div className="statistics-ranking">
                {statistics.referrers.length ? (
                  statistics.referrers.map(
                    (item) => (
                      <div
                        className="statistics-ranking-row no-rank"
                        key={item.domain}
                      >
                        <div className="statistics-ranking-content">
                          <div className="statistics-ranking-copy">
                            <strong>
                              {item.domain}
                            </strong>

                            <span>
                              {formatNumber(
                                item.sessions,
                              )}
                            </span>
                          </div>

                          <div className="statistics-bar">
                            <span
                              style={{
                                width: `${Math.max(
                                  4,
                                  (item.sessions /
                                    referrerMaximum) *
                                    100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <p className="statistics-empty">
                    No referrer data in this
                    range.
                  </p>
                )}
              </div>
            </article>
          </section>

          <section className="statistics-scroll-panel">
            <div className="statistics-panel-header">
              <div>
                <p className="admin-kicker">
                  Engagement depth
                </p>

                <h2>
                  How far visitors travel.
                </h2>
              </div>

              <div className="statistics-depth-average">
                <strong>
                  {
                    statistics.scrollDepth
                      .averageDepth
                  }
                  %
                </strong>

                <span>
                  Average maximum depth
                </span>
              </div>
            </div>

            <div className="statistics-depth-grid">
              {[
                {
                  label: "25%",
                  value:
                    statistics.scrollDepth
                      .reached25,
                },
                {
                  label: "50%",
                  value:
                    statistics.scrollDepth
                      .reached50,
                },
                {
                  label: "75%",
                  value:
                    statistics.scrollDepth
                      .reached75,
                },
                {
                  label: "100%",
                  value:
                    statistics.scrollDepth
                      .reached100,
                },
              ].map((item) => {
                const denominator =
                  Math.max(
                    1,
                    statistics.scrollDepth
                      .trackedPageVisits,
                  );

                const percentage =
                  (item.value /
                    denominator) *
                  100;

                return (
                  <article
                    key={item.label}
                  >
                    <span>
                      Reached {item.label}
                    </span>

                    <strong>
                      {formatNumber(
                        item.value,
                      )}
                    </strong>

                    <div className="statistics-depth-track">
                      <span
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <small>
                      {percentage.toFixed(
                        1,
                      )}
                      % of tracked page
                      visits
                    </small>
                  </article>
                );
              })}
            </div>
          </section>

          <footer className="statistics-footer">
            <span>
              Generated{" "}
              {new Date(
                statistics.generatedAt,
              ).toLocaleString()}
            </span>

            <span>
              {
                statistics.scrollDepth
                  .trackedPageVisits
              }{" "}
              scroll-tracked page visits
            </span>
          </footer>
        </>
      ) : null}
    </section>
  );
}
