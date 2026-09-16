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
    if (!expiryTimestamp || expiryTimestamp <= Date.now()) {
      setTimeStr("00:00:00:00");
      return;
    }

    setTimeStr(formatTimeRemaining(expiryTimestamp));
    const interval = setInterval(() => {
      if (Date.now() >= expiryTimestamp) {
        setTimeStr("00:00:00:00");
        clearInterval(interval);
        return;
      }
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
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {timeStr}
    </span>
  );
}
