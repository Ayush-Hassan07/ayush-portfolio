"use client";

import type { ReactNode } from "react";

type JourneyScrollButtonProps = {
  targetId: string;
  className?: string;
  children: ReactNode;
};

export default function JourneyScrollButton({
  targetId,
  className,
  children,
}: JourneyScrollButtonProps) {
  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(null, "", "/journey");
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
