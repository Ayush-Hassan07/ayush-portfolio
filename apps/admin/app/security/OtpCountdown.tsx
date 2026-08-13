"use client";

import { useEffect, useState } from "react";

export function OtpCountdown({ seconds = 60 }: { seconds?: number }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(value - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <span className={remaining <= 10 ? "otp-countdown urgent" : "otp-countdown"} aria-live="polite">{remaining}s remaining</span>;
}
