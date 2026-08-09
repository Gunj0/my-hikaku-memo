import { useStepGestureNavigation } from "@/hooks/use-step-gesture-navigation";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

function Harness({
  onPrev,
  onNext,
  enabled = true,
}: {
  onPrev: () => void;
  onNext: () => void;
  enabled?: boolean;
}) {
  const handlers = useStepGestureNavigation({ onPrev, onNext, enabled });

  return (
    <main data-testid="main" {...handlers}>
      <div
        data-testid="scroller"
        style={{ overflowX: "auto" }}
        ref={(node) => {
          if (node) {
            // jsdom はレイアウトを持たないため、横スクロール可能な状態を再現する
            Object.defineProperty(node, "scrollWidth", {
              configurable: true,
              value: 800,
            });
            Object.defineProperty(node, "clientWidth", {
              configurable: true,
              value: 320,
            });
          }
        }}
      >
        <span data-testid="cell">評価テーブル</span>
      </div>
      <textarea data-testid="memo" />
    </main>
  );
}

function swipe(target: Element, from: number, to: number, dy = 10) {
  fireEvent.touchStart(target, { touches: [{ clientX: from, clientY: 200 }] });
  fireEvent.touchEnd(target, {
    changedTouches: [{ clientX: to, clientY: 200 + dy }],
  });
}

describe("useStepGestureNavigation", () => {
  it("左右キーで前後のステップへ移動する", () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();

    render(<Harness onPrev={onPrev} onNext={onNext} />);

    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    fireEvent.keyDown(document.body, { key: "ArrowLeft" });

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("修飾キー併用・IME 変換中・enabled=false では移動しない", () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const { rerender } = render(<Harness onPrev={onPrev} onNext={onNext} />);

    fireEvent.keyDown(document.body, { key: "ArrowRight", metaKey: true });
    fireEvent.keyDown(document.body, { key: "ArrowRight", shiftKey: true });
    fireEvent.keyDown(document.body, { key: "ArrowRight", isComposing: true });

    rerender(<Harness onPrev={onPrev} onNext={onNext} enabled={false} />);
    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    swipe(screen.getByTestId("main"), 240, 60);

    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
  });

  it("横スクロール領域から始まったスワイプでは移動しない", () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();

    render(<Harness onPrev={onPrev} onNext={onNext} />);

    // スクロール領域の内側の要素から開始しても、祖先を辿って除外する
    swipe(screen.getByTestId("cell"), 240, 60);

    expect(onNext).not.toHaveBeenCalled();

    swipe(screen.getByTestId("main"), 240, 60);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("入力欄から始まったスワイプでは移動しない", () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();

    render(<Harness onPrev={onPrev} onNext={onNext} />);

    swipe(screen.getByTestId("memo"), 240, 60);

    expect(onNext).not.toHaveBeenCalled();
  });

  it("マルチタッチになったスワイプは破棄する", () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();

    render(<Harness onPrev={onPrev} onNext={onNext} />);

    const main = screen.getByTestId("main");

    fireEvent.touchStart(main, { touches: [{ clientX: 240, clientY: 200 }] });
    fireEvent.touchMove(main, {
      touches: [
        { clientX: 200, clientY: 200 },
        { clientX: 100, clientY: 260 },
      ],
    });
    fireEvent.touchEnd(main, {
      changedTouches: [{ clientX: 60, clientY: 210 }],
    });

    expect(onNext).not.toHaveBeenCalled();
  });
});
