import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";
import { formatDimension } from "@/features/shipping-boxes/lib/format-dimension";

const MAX_FACE_PX = 112;

interface ParsedDimensions {
  length: number;
  width: number;
  height: number;
}

function parseDimensions(
  lengthCm: string,
  widthCm: string,
  heightCm: string,
): ParsedDimensions | null {
  const length = Number(lengthCm);
  const width = Number(widthCm);
  const height = Number(heightCm);

  if (
    !Number.isFinite(length) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    length <= 0 ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  return { length, width, height };
}

function scaleDimensions(dimensions: ParsedDimensions) {
  const maxDim = Math.max(
    dimensions.length,
    dimensions.width,
    dimensions.height,
  );
  const factor = MAX_FACE_PX / maxDim;

  return {
    depth: dimensions.length * factor,
    width: dimensions.width * factor,
    height: dimensions.height * factor,
  };
}

interface ShippingBoxPreviewProps {
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  className?: string;
}

export function ShippingBoxPreview({
  lengthCm,
  widthCm,
  heightCm,
  className,
}: ShippingBoxPreviewProps) {
  const { t } = useTranslation("shippingBoxes");
  const unit = t("table.unit");

  const dimensions = useMemo(
    () => parseDimensions(lengthCm, widthCm, heightCm),
    [lengthCm, widthCm, heightCm],
  );

  const scaled = useMemo(
    () => (dimensions ? scaleDimensions(dimensions) : null),
    [dimensions],
  );

  const label = dimensions
    ? t("preview.label", {
        length: formatDimension(dimensions.length),
        width: formatDimension(dimensions.width),
        height: formatDimension(dimensions.height),
        unit,
      })
    : t("preview.empty");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-5",
        className,
      )}
    >
      <p className="sr-only">{label}</p>

      <div
        className="relative flex h-40 w-full items-center justify-center"
        aria-hidden="true"
      >
        {scaled ? (
          <div
            className="[perspective:640px]"
            style={{ perspective: "640px" }}
          >
            <div
              className="relative [transform-style:preserve-3d] motion-safe:transition-transform motion-safe:duration-300"
              style={{
                width: scaled.width,
                height: scaled.height,
                transform: "rotateX(-20deg) rotateY(-28deg)",
              }}
            >
              <BoxFace
                width={scaled.width}
                height={scaled.height}
                transform={`translateZ(${scaled.depth / 2}px)`}
                className="bg-primary/20 border-primary/35"
              />
              <BoxFace
                width={scaled.width}
                height={scaled.height}
                transform={`rotateY(180deg) translateZ(${scaled.depth / 2}px)`}
                className="bg-primary/10 border-primary/25"
              />
              <BoxFace
                width={scaled.depth}
                height={scaled.height}
                transform={`rotateY(90deg) translateZ(${scaled.width / 2}px)`}
                className="bg-primary/14 border-primary/30"
              />
              <BoxFace
                width={scaled.depth}
                height={scaled.height}
                transform={`rotateY(-90deg) translateZ(${scaled.width / 2}px)`}
                className="bg-primary/14 border-primary/30"
              />
              <BoxFace
                width={scaled.width}
                height={scaled.depth}
                transform={`rotateX(90deg) translateZ(${scaled.height / 2}px)`}
                className="bg-primary/26 border-primary/40"
              />
              <BoxFace
                width={scaled.width}
                height={scaled.depth}
                transform={`rotateX(-90deg) translateZ(${scaled.height / 2}px)`}
                className="bg-primary/8 border-primary/20"
              />
            </div>
          </div>
        ) : (
          <div className="grid size-24 place-items-center rounded-lg border border-dashed border-border/80 bg-background/60">
            <div className="size-14 rounded-sm border border-border/70 bg-muted/40" />
          </div>
        )}
      </div>

      <p
        dir="ltr"
        className="text-center text-xs tabular-nums text-muted-foreground"
        aria-hidden="true"
      >
        {dimensions ? (
          <>
            {formatDimension(dimensions.length)} ×{" "}
            {formatDimension(dimensions.width)} ×{" "}
            {formatDimension(dimensions.height)} {unit}
          </>
        ) : (
          t("preview.placeholder")
        )}
      </p>
    </div>
  );
}

interface BoxFaceProps {
  width: number;
  height: number;
  transform: string;
  className?: string;
}

function BoxFace({ width, height, transform, className }: BoxFaceProps) {
  return (
    <div
      className={cn(
        "absolute left-1/2 top-1/2 border shadow-sm [backface-visibility:visible]",
        className,
      )}
      style={{
        width,
        height,
        transform: `translate(-50%, -50%) ${transform}`,
      }}
    />
  );
}
