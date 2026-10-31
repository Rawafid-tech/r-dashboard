import type { KeyboardEvent } from "react";

/**
 * WAI-ARIA tabs keyboard support for a `role="tablist"` element: Left/Right
 * (mirrored in RTL), Home and End move focus to a tab and activate it.
 * Attach as the tablist's `onKeyDown`.
 */
export function handleTablistKeyDown(event: KeyboardEvent<HTMLElement>) {
  const tabs = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      '[role="tab"]:not([disabled]):not([aria-disabled="true"])',
    ),
  );
  const current = tabs.indexOf(document.activeElement as HTMLElement);
  if (current < 0 || tabs.length < 2) return;

  const isRtl = getComputedStyle(event.currentTarget).direction === "rtl";
  const forward = isRtl ? "ArrowLeft" : "ArrowRight";
  const backward = isRtl ? "ArrowRight" : "ArrowLeft";

  let next: number;
  switch (event.key) {
    case forward:
      next = (current + 1) % tabs.length;
      break;
    case backward:
      next = (current - 1 + tabs.length) % tabs.length;
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = tabs.length - 1;
      break;
    default:
      return;
  }

  event.preventDefault();
  const target = tabs[next];
  target?.focus();
  target?.click();
}
