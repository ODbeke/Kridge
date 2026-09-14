"use client";

import React, { useState, useEffect } from "react";
import { formatTimeRemaining } from "@/lib/utils";

interface CountdownTimerProps {
  expiryTimestamp: number;
  className?: string;
  style?: React.CSSProperties;
  showIcon?: boolean;
}

export function CountdownTimer({
  expiryTimestamp,
  className,
  style,
  showIcon = false,
}: CountdownTimerProps) {
  const [timeStr, setTimeStr] = useState<string>(() => formatTimeRemaining(expiryTimestamp));

  useEffect(() => {
    setTimeStr(formatTimeRemaining(expiryTimestamp));
    const interval = setInterval(() => {
      setTimeStr(formatTimeRemaining(expiryTimestamp));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp]);

  return (
    <span
      className={className}
      title="Days : Hours : Minutes : Seconds (dd:hh:mm:ss)"
      style={{
        fontVariantNumeric: "tabular-nums",
        fontFeatureSettings: "'tnum'",
        ...style,
      }}
    >
      {showIcon && "⏱ "}
      {timeStr}
    </span>
  );
}
