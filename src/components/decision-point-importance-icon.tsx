import { CircleAlertIcon, CircleIcon, TriangleIcon, XIcon } from "lucide-react";

import {
  getDecisionPointImportanceOption,
  type DecisionPointImportanceIconName,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type DecisionPointImportanceIconProps = {
  weight: number;
  className?: string;
};

const IMPORTANCE_ICONS: Record<
  DecisionPointImportanceIconName,
  typeof CircleIcon
> = {
  "circle-alert": CircleAlertIcon,
  circle: CircleIcon,
  triangle: TriangleIcon,
  x: XIcon,
};

export function DecisionPointImportanceIcon({
  weight,
  className,
}: DecisionPointImportanceIconProps) {
  const option = getDecisionPointImportanceOption(weight);

  if (!option) {
    return null;
  }

  const Icon = IMPORTANCE_ICONS[option.icon];

  return (
    <span title={option.message} aria-label={option.message}>
      <Icon className={cn("h-4 w-4", className)} />
    </span>
  );
}
