"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type ComponentProps, useState } from "react";

interface EditableItemNameProps extends Omit<
  ComponentProps<typeof Input>,
  "type" | "value" | "onChange"
> {
  value: string;
  onCommit: (value: string) => void;
}

export function EditableItemName({
  value,
  onBlur,
  onCommit,
  onKeyDown,
  className,
  ...props
}: EditableItemNameProps) {
  const [draft, setDraft] = useState(value);
  const [lastSyncedValue, setLastSyncedValue] = useState(value);

  if (value !== lastSyncedValue) {
    setLastSyncedValue(value);
    setDraft(value);
  }

  const commit = () => {
    const trimmedValue = draft.trim();
    const nextValue = trimmedValue.length > 0 ? trimmedValue : value;

    if (nextValue !== draft) {
      setDraft(nextValue);
    }

    if (nextValue !== value) {
      onCommit(nextValue);
    }
  };

  return (
    <Input
      {...props}
      type="text"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => {
        onBlur?.(event);
        commit();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (event.key === "Enter" && !event.nativeEvent.isComposing) {
          event.preventDefault();
          commit();
          event.currentTarget.blur();
        }
      }}
      className={cn("min-w-0", className)}
    />
  );
}
