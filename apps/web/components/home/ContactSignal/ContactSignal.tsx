import TrackedLink from "@/components/analytics/TrackedLink";

import styles from "./ContactSignal.module.css";

type Props = {
  email?: string | null;
};

export default function ContactSignal({
  email,
}: Props) {
  if (!email) {
    return null;
  }

  return (
    <section
      id="contact"
      className={styles.section}
      aria-labelledby="contact-signal-title"
    >
      <div className={styles.signalMeta}>
        <span>// OPEN CHANNEL</span>

        <div>
          <i />
          <span>AVAILABLE FOR CONVERSATION</span>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.copy}>
          <span className={styles.index}>
            04 / CONNECTION
          </span>

          <h2 id="contact-signal-title">
            Have a system to build,
            <br />
            a problem to solve,
            <br />
            or an idea worth exploring?
          </h2>
        </div>

        <TrackedLink
          href={`mailto:${email}`}
          className={styles.contactAction}
          eventType="CONTACT_CLICK"
          action="start_conversation"
          label="Start a Conversation"
        >
          <div className={styles.actionCopy}>
            <small>DIRECT CHANNEL</small>
            <span className={styles.actionLabel}>
              START A CONVERSATION
            </span>
          </div>

          <span className={styles.actionArrow}>
            ↗
          </span>
        </TrackedLink>
      </div>

      <div className={styles.footer}>
        <div className={styles.channel}>
          <span>DIRECT CHANNEL</span>

          <TrackedLink
            href={`mailto:${email}`}
            eventType="CONTACT_CLICK"
            action="email"
            label="Email"
          >
            {email}
          </TrackedLink>
        </div>

        <div className={styles.signalLine}>
          <i />
          <span />
          <i />
        </div>

        <span className={styles.endpoint}>
          AHR / END OF TRANSMISSION
        </span>
      </div>
    </section>
  );
}