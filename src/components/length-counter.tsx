import { cn } from "@/lib/utils";

type LengthCounterProps = {
  current: number;
  max: number;
  className?: string;
};

export function LengthCounter({ current, max, className }: LengthCounterProps) {
  return (
    <p
      className={cn(
        "text-right text-[11px] tabular-nums text-muted-foreground",
        className,
      )}
    >
      {current}/{max}
    </p>
  );
}
