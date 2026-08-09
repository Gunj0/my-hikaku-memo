"use client";

import { useCallback, useEffect, useRef } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";

/** スワイプと判定する最小の水平移動量(px) */
const SWIPE_MIN_DISTANCE = 60;
/** 水平移動量に対して許容する垂直移動量の比率（縦スクロールとの誤判定を防ぐ） */
const SWIPE_MAX_VERTICAL_RATIO = 0.7;
/** スワイプと判定する最大時間(ms) */
const SWIPE_MAX_DURATION = 800;

function isTextEntryElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * 評価入力の横スクロールテーブルなど、横スクロール可能な領域から始まったタッチかどうか。
 * 該当する場合はスクロール操作を優先し、スワイプ判定しない。
 */
function isWithinHorizontalScrollArea(
  target: EventTarget | null,
  boundary: Element,
): boolean {
  let node = target instanceof Element ? target : null;

  while (node && node !== boundary) {
    if (node.scrollWidth > node.clientWidth) {
      const { overflowX } = window.getComputedStyle(node);

      if (overflowX === "auto" || overflowX === "scroll") {
        return true;
      }
    }

    node = node.parentElement;
  }

  return false;
}

type StepGestureNavigationOptions = {
  onPrev: () => void;
  onNext: () => void;
  /** ダイアログ表示中などジェスチャーを無効にしたいときに false を渡す */
  enabled?: boolean;
};

/**
 * ステップ間を左右キー・横スワイプで移動するためのジェスチャー。
 * 入力欄にフォーカスがある間はキー操作を奪わない。
 */
export function useStepGestureNavigation({
  onPrev,
  onNext,
  enabled = true,
}: StepGestureNavigationOptions) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.isComposing
      ) {
        return;
      }

      if (isTextEntryElement(event.target)) {
        return;
      }

      if (isTextEntryElement(document.activeElement)) {
        return;
      }

      event.preventDefault();

      if (event.key === "ArrowLeft") {
        onPrev();
      } else {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onNext, onPrev]);

  const onTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLElement>) => {
      if (
        !enabled ||
        event.touches.length !== 1 ||
        isTextEntryElement(event.target) ||
        isWithinHorizontalScrollArea(event.target, event.currentTarget)
      ) {
        touchStartRef.current = null;
        return;
      }

      const touch = event.touches[0];

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },
    [enabled],
  );

  const onTouchMove = useCallback((event: ReactTouchEvent<HTMLElement>) => {
    // マルチタッチ（ピンチなど）になったらスワイプ判定を破棄する
    if (event.touches.length > 1) {
      touchStartRef.current = null;
    }
  }, []);

  const onTouchEnd = useCallback(
    (event: ReactTouchEvent<HTMLElement>) => {
      const start = touchStartRef.current;

      touchStartRef.current = null;

      if (!enabled || !start) {
        return;
      }

      const touch = event.changedTouches[0];

      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;

      if (Date.now() - start.time > SWIPE_MAX_DURATION) {
        return;
      }

      if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE) {
        return;
      }

      if (Math.abs(deltaY) > Math.abs(deltaX) * SWIPE_MAX_VERTICAL_RATIO) {
        return;
      }

      if (deltaX > 0) {
        onPrev();
      } else {
        onNext();
      }
    },
    [enabled, onNext, onPrev],
  );

  return { onTouchStart, onTouchMove, onTouchEnd };
}
