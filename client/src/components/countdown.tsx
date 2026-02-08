import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown({ targetDate }: CountdownProps) {
  const [time, setTime] = useState<TimeLeft>(
    targetDate ? calcTimeLeft(targetDate) : { days: 0, hours: 0, minutes: 0, seconds: 0 }
  );

  useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => {
      setTime(calcTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) {
    return (
      <div className="text-center py-8">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Drop date coming soon</p>
      </div>
    );
  }

  const blocks = [
    { label: "DAYS", value: time.days },
    { label: "HRS", value: time.hours },
    { label: "MIN", value: time.minutes },
    { label: "SEC", value: time.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4" data-testid="countdown-timer">
      {blocks.map((block, i) => (
        <div key={block.label} className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <span className="font-mono text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight tabular-nums">
              {String(block.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs tracking-[0.3em] text-muted-foreground mt-2">
              {block.label}
            </span>
          </div>
          {i < blocks.length - 1 && (
            <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-light text-muted-foreground self-start mt-1">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
