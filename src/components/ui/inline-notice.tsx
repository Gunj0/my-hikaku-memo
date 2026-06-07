import { cn } from "@/lib/utils";
import {
  CheckCircle2Icon,
  CircleAlertIcon,
  InfoIcon,
  XIcon,
} from "lucide-react";

type InlineNoticeTone = "success" | "error" | "info";

type InlineNoticeProps = {
  tone: InlineNoticeTone;
  message: string;
  className?: string;
  onDismiss?: () => void;
  dismissLabel?: string;
};

const toneStyles: Record<InlineNoticeTone, string> = {
  success:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-100 [&_svg]:text-emerald-300",
  error:
    "border-destructive/50 bg-destructive/10 text-destructive [&_svg]:text-destructive",
  info: "border-border/80 bg-background/60 text-foreground [&_svg]:text-primary",
};

const toneIcons = {
  success: CheckCircle2Icon,
  error: CircleAlertIcon,
  info: InfoIcon,
} satisfies Record<
  InlineNoticeTone,
  React.ComponentType<{ className?: string }>
>;

export function InlineNotice({
  tone,
  message,
  className,
  onDismiss,
  dismissLabel = "通知を閉じる",
}: InlineNoticeProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn(
        "flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm leading-6 shadow-sm",
        toneStyles[tone],
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="min-w-0">{message}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="-mr-1 inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-current/80 transition hover:bg-black/10 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
