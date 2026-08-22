import {
  getDecisionPointImportanceOption,
  type DecisionPointImportanceIconName,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type ImportanceIconProps = {
  className?: string;
};

/** 必須: 二重丸。中心の塗りで最も強い重みを示す。 */
function RequiredIcon({ className }: ImportanceIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="12" r="4.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** できれば: 丸。 */
function PreferredIcon({ className }: ImportanceIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9.5" />
    </svg>
  );
}

/** どちらでも: 三角。 */
function EitherIcon({ className }: ImportanceIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3.5 21.5 20.5H2.5Z" />
    </svg>
  );
}

const IMPORTANCE_ICONS: Record<
  DecisionPointImportanceIconName,
  (props: ImportanceIconProps) => React.ReactElement
> = {
  required: RequiredIcon,
  preferred: PreferredIcon,
  either: EitherIcon,
};

type DecisionPointImportanceIconProps = {
  weight: number;
  /** アイコン横のラベル表示。false でアイコンのみ。 */
  showLabel?: boolean;
  className?: string;
  labelClassName?: string;
};

export function DecisionPointImportanceIcon({
  weight,
  showLabel = true,
  className,
  labelClassName,
}: DecisionPointImportanceIconProps) {
  const option = getDecisionPointImportanceOption(weight);

  if (!option) {
    return null;
  }

  const Icon = IMPORTANCE_ICONS[option.icon];

  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap"
      title={option.message}
      aria-label={option.message}
    >
      <Icon className={cn("h-4 w-4 shrink-0", className)} />
      {showLabel ? (
        <span
          aria-hidden="true"
          className={cn("text-xs leading-none", labelClassName)}
        >
          {option.message}
        </span>
      ) : null}
    </span>
  );
}
