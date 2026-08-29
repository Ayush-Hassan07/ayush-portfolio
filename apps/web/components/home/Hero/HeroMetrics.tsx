import styles from "./Hero.module.css";

type Props = {
  projects: number;
  publications: number;
  technologies: number;
  capabilities: number;
};

export default function HeroMetrics({
  projects,
  publications,
  technologies,
  capabilities,
}: Props) {
  const metrics = [
    {
      value: projects,
      label: "SYSTEMS",
      sub: "PROJECT RECORDS",
      code: "SYS",
    },
    {
      value: publications,
      label: "PAPERS",
      sub: "PUBLISHED WORK",
      code: "RSH",
    },
    {
      value: technologies,
      label: "TECH",
      sub: "IMPLEMENTATION STACK",
      code: "STK",
    },
    {
      value: capabilities,
      label: "CAPABILITIES",
      sub: "TECHNICAL INDEX",
      code: "CAP",
    },
  ];

  return (
    <div className={styles.metrics}>
      {metrics.map((metric, index) => (
        <div className={styles.metric} key={metric.label}>
          <div className={styles.metricHead}>
            <span className={styles.metricIndex}>
              0{index + 1}
            </span>

            <span className={styles.metricCode}>
              {metric.code}
            </span>
          </div>

          <div className={styles.metricMain}>
            <strong>
              {String(metric.value).padStart(2, "0")}
            </strong>

            <div className={styles.metricCopy}>
              <span>{metric.label}</span>
              <small>{metric.sub}</small>
            </div>
          </div>

          <div className={styles.metricSignal}>
            <span />
            <i />
          </div>
        </div>
      ))}
    </div>
  );
}