import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function swapArrayItems<T>(
  items: T[],
  firstIndex: number,
  secondIndex: number,
) {
  if (
    firstIndex === secondIndex ||
    firstIndex < 0 ||
    secondIndex < 0 ||
    firstIndex >= items.length ||
    secondIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [...items];
  const temporaryItem = nextItems[firstIndex];

  nextItems[firstIndex] = nextItems[secondIndex];
  nextItems[secondIndex] = temporaryItem;

  return nextItems;
}
