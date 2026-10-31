import { useId, type ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";
import {
  LOCKUP_VIEWBOX,
  MARK_ARROW,
  MARK_GRADIENT,
  MARK_NODES,
  MARK_STROKES,
  MARK_STROKE_WIDTH,
  MARK_VIEWBOX,
  WORDMARK_AR,
  WORDMARK_EN,
} from "./rawafid-logo-paths";

/** "auto" follows the app theme; "onDark" is for surfaces that are dark in both themes. */
type LogoTone = "auto" | "onDark";

// Literal class strings so Tailwind can see them. Colors mirror MARK_GRADIENT.
const STOP_CLASSES: Record<LogoTone, readonly string[]> = {
  auto: [
    "[stop-color:#0B2A6B] dark:[stop-color:#2563EB]",
    "[stop-color:#1D63E0] dark:[stop-color:#1D8FE6]",
    "[stop-color:#0E9BD8] dark:[stop-color:#10B3C9]",
    "[stop-color:#22C55E]",
  ],
  onDark: [
    "[stop-color:#2563EB]",
    "[stop-color:#1D8FE6]",
    "[stop-color:#10B3C9]",
    "[stop-color:#22C55E]",
  ],
};

type LogoProps = Omit<ComponentProps<"svg">, "viewBox"> & { tone?: LogoTone };

function MarkShapes({ tone }: { tone: LogoTone }) {
  // React ids contain characters that are awkward inside url(#...).
  const gradientId = `rw-logo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const paint = `url(#${gradientId})`;

  return (
    <>
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={MARK_GRADIENT.x1}
          y1={MARK_GRADIENT.y1}
          x2={MARK_GRADIENT.x2}
          y2={MARK_GRADIENT.y2}
        >
          {MARK_GRADIENT.offsets.map((offset, index) => (
            <stop key={offset} offset={offset} className={STOP_CLASSES[tone][index]} />
          ))}
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke={paint}
        strokeWidth={MARK_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {MARK_STROKES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill={paint}>
        {MARK_NODES.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
        <path d={MARK_ARROW} stroke={paint} strokeWidth={6} strokeLinejoin="round" />
      </g>
    </>
  );
}

export function RawafidLogoMark({ className, tone = "auto", ...props }: LogoProps) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={cn("size-9 shrink-0", className)}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <MarkShapes tone={tone} />
    </svg>
  );
}

/** Full lockup: mark + روافد / RAWAFID. The wordmark uses currentColor. */
export function RawafidLogo({ className, tone = "auto", ...props }: LogoProps) {
  return (
    <svg
      viewBox={LOCKUP_VIEWBOX}
      className={cn("h-9 w-auto shrink-0", className)}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <MarkShapes tone={tone} />
      <g fill="currentColor">
        <path d={WORDMARK_AR} />
        <path d={WORDMARK_EN} />
      </g>
    </svg>
  );
}
