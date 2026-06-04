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

function renderIcon(iconName: DecisionPointImportanceIconName) {
  switch (iconName) {
    case "circle-alert":
      return CircleAlertIcon;
    case "circle":
      return CircleIcon;
    case "triangle":
      return TriangleIcon;
    case "x":
      return XIcon;
  }
}

export function DecisionPointImportanceIcon({
  weight,
  className,
}: DecisionPointImportanceIconProps) {
  const option = getDecisionPointImportanceOption(weight);

  if (!option) {
    return null;
  }

  const Icon = renderIcon(option.icon);

  return (
    <span title={option.message} aria-label={option.message}>
      <Icon className={cn("h-4 w-4", className)} />
    </span>
  );
}
