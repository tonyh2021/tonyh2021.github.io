"use client";

import type { CSSProperties, MouseEvent } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export type MagnifiedDockSlot =
  | {
      kind: "icon";
      id: string;
      name: string;
      icon: string;
      link?: string;
      isOpen?: boolean;
      onActivate: () => void;
    }
  | { kind: "separator" };

interface MagnifiedDockBarProps {
  slots: MagnifiedDockSlot[];
  className?: string;
}

function publicAssetUrl(path: string): string {
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/${path}`;
}

export default function MagnifiedDockBar({
  slots,
  className = "",
}: MagnifiedDockBarProps) {
  const slotsKey = useMemo(
    () => slots.map((s) => (s.kind === "icon" ? s.id : "|")).join(),
    [slots],
  );

  const [mouseX, setMouseX] = useState<number | null>(null);
  const [currentScales, setCurrentScales] = useState<number[]>(() =>
    slots.map(() => 1),
  );
  const [currentPositions, setCurrentPositions] = useState<number[]>([]);
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLElement | null)[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastMouseMoveTime = useRef(0);
  const scalesRef = useRef<number[]>(slots.map(() => 1));
  const positionsRef = useRef<number[]>([]);

  const getResponsiveConfig = useCallback(() => {
    if (typeof window === "undefined") {
      return { baseIconSize: 52, maxScale: 1.65, effectWidth: 260 };
    }

    const smallerDimension = Math.min(window.innerWidth, window.innerHeight);

    if (smallerDimension < 480) {
      return {
        baseIconSize: Math.max(36, smallerDimension * 0.075),
        maxScale: 1.38,
        effectWidth: smallerDimension * 0.42,
      };
    }
    if (smallerDimension < 768) {
      return {
        baseIconSize: Math.max(44, smallerDimension * 0.065),
        maxScale: 1.48,
        effectWidth: smallerDimension * 0.36,
      };
    }
    if (smallerDimension < 1024) {
      return {
        baseIconSize: Math.max(50, smallerDimension * 0.055),
        maxScale: 1.62,
        effectWidth: Math.min(280, smallerDimension * 0.32),
      };
    }
    return {
      baseIconSize: Math.max(52, Math.min(72, smallerDimension * 0.048)),
      maxScale: 1.78,
      effectWidth: 300,
    };
  }, []);

  const [config, setConfig] = useState(getResponsiveConfig);
  const { baseIconSize, maxScale, effectWidth } = config;
  const minScale = 1;
  const baseSpacing = Math.max(3, baseIconSize * 0.07);
  const sepWidth = Math.max(8, baseIconSize * 0.12);

  useEffect(() => {
    const handleResize = () => setConfig(getResponsiveConfig());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getResponsiveConfig]);

  const slotWidth = useCallback(
    (index: number, scale: number) => {
      const slot = slots[index];
      if (slot?.kind === "separator") return sepWidth;
      return baseIconSize * scale;
    },
    [slots, baseIconSize, sepWidth],
  );

  const iconCenterInRow = useCallback(
    (index: number, scales: number[]) => {
      let x = 0;
      for (let i = 0; i < index; i++) {
        x += slotWidth(i, scales[i]) + baseSpacing;
      }
      return x + slotWidth(index, scales[index]) / 2;
    },
    [baseSpacing, slotWidth],
  );

  const calculateTargetMagnification = useCallback(
    (mousePosition: number | null, scales: number[]) => {
      if (mousePosition === null) {
        return slots.map(() => minScale);
      }

      return slots.map((slot, index) => {
        if (slot.kind === "separator") return minScale;

        const center = iconCenterInRow(index, scales);
        const minX = mousePosition - effectWidth / 2;
        const maxX = mousePosition + effectWidth / 2;

        if (center < minX || center > maxX) {
          return minScale;
        }

        const theta = ((center - minX) / effectWidth) * 2 * Math.PI;
        const cappedTheta = Math.min(Math.max(theta, 0), 2 * Math.PI);
        const scaleFactor = (1 - Math.cos(cappedTheta)) / 2;

        return minScale + scaleFactor * (maxScale - minScale);
      });
    },
    [slots, effectWidth, maxScale, minScale, iconCenterInRow],
  );

  const calculatePositions = useCallback(
    (scales: number[]) => {
      let currentX = 0;
      return scales.map((scale, index) => {
        const w = slotWidth(index, scale);
        const centerX = currentX + w / 2;
        currentX += w + baseSpacing;
        return centerX;
      });
    },
    [baseSpacing, slotWidth],
  );

  useEffect(() => {
    const initialScales = slots.map((s) =>
      s.kind === "separator" ? minScale : minScale,
    );
    const initialPositions = calculatePositions(initialScales);
    scalesRef.current = initialScales;
    positionsRef.current = initialPositions;
    setCurrentScales(initialScales);
    setCurrentPositions(initialPositions);
    // slotsKey tracks slot identity; full `slots` ref changes every parent render
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when layout ids / count change
  }, [slotsKey, baseIconSize, sepWidth, calculatePositions, minScale]);

  const animateToTarget = useCallback(() => {
    const prevScales = scalesRef.current;
    const targetScales = calculateTargetMagnification(mouseX, prevScales);
    const lerpFactor = mouseX !== null ? 0.22 : 0.14;

    const nextScales = prevScales.map((currentScale, index) => {
      const diff = targetScales[index] - currentScale;
      return currentScale + diff * lerpFactor;
    });

    const targetPositions = calculatePositions(nextScales);
    const nextPositions = positionsRef.current.map((currentPos, index) => {
      const diff = targetPositions[index] - currentPos;
      return currentPos + diff * lerpFactor;
    });

    scalesRef.current = nextScales;
    positionsRef.current = nextPositions;
    setCurrentScales(nextScales);
    setCurrentPositions(nextPositions);

    const scalesNeedUpdate = nextScales.some(
      (scale, index) => Math.abs(scale - targetScales[index]) > 0.003,
    );
    const positionsNeedUpdate = nextPositions.some(
      (pos, index) => Math.abs(pos - targetPositions[index]) > 0.15,
    );

    if (scalesNeedUpdate || positionsNeedUpdate || mouseX !== null) {
      animationFrameRef.current = requestAnimationFrame(animateToTarget);
    }
  }, [mouseX, calculateTargetMagnification, calculatePositions]);

  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animateToTarget);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateToTarget]);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const now = performance.now();
      if (now - lastMouseMoveTime.current < 16) return;
      lastMouseMoveTime.current = now;

      if (dockRef.current) {
        const rect = dockRef.current.getBoundingClientRect();
        const padding = Math.max(8, baseIconSize * 0.12);
        setMouseX(e.clientX - rect.left - padding);
      }
    },
    [baseIconSize],
  );

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  const createBounceAnimation = (element: HTMLElement) => {
    const bounceHeight = Math.max(-8, -baseIconSize * 0.14);
    element.style.transition = "transform 0.22s ease-out";
    element.style.transform = `translateY(${bounceHeight}px)`;
    window.setTimeout(() => {
      element.style.transform = "translateY(0px)";
    }, 220);
  };

  const handleIconClick = (slotIndex: number, iconIdx: number) => {
    const slot = slots[slotIndex];
    if (slot.kind !== "icon") return;

    const el = iconRefs.current[iconIdx];
    if (el) {
      createBounceAnimation(el);
    }
    slot.onActivate();
  };

  const contentWidth =
    currentPositions.length > 0
      ? Math.max(
          ...currentPositions.map((pos, index) => {
            const w = slotWidth(index, currentScales[index]);
            return pos + w / 2;
          }),
        )
      : slots.reduce((acc, s, i) => {
          if (s.kind === "separator") return acc + sepWidth + baseSpacing;
          return acc + baseIconSize + baseSpacing;
        }, 0) - baseSpacing;

  const padding = Math.max(8, baseIconSize * 0.12);

  return (
    <div
      className={cn(
        "border border-white/25 bg-white/20 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-black/35 dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
        className,
      )}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={dockRef}
      style={{
        width: `${contentWidth + padding * 2}px`,
        borderRadius: `${Math.max(12, baseIconSize * 0.38)}px`,
        boxShadow: `
          0 ${Math.max(4, baseIconSize * 0.08)}px ${Math.max(18, baseIconSize * 0.38)}px rgba(0, 0, 0, 0.18),
          inset 0 1px 0 rgba(255, 255, 255, 0.35)
        `,
        padding: `${padding}px`,
      }}
    >
      <div
        className="relative"
        style={{
          height: `${baseIconSize * maxScale * 0.95}px`,
          width: "100%",
        }}
      >
        {slots.map((slot, index) => {
          const scale = currentScales[index] ?? 1;
          const position = currentPositions[index] ?? 0;

          if (slot.kind === "separator") {
            const w = slotWidth(index, scale);
            return (
              <div
                key={`sep-${index}`}
                className="absolute bottom-0 flex items-center justify-center"
                style={{
                  left: `${position - w / 2}px`,
                  width: `${w}px`,
                  height: `${baseIconSize * 0.85}px`,
                }}
              >
                <div className="h-9 w-px rounded-full bg-white/30 dark:bg-white/20" />
              </div>
            );
          }

          const iconIdx = slots
            .slice(0, index)
            .filter((s) => s.kind === "icon").length;
          const scaledSize = baseIconSize * scale;

          const inner = (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={slot.name}
                className="object-contain select-none"
                draggable={false}
                height={scaledSize}
                src={publicAssetUrl(slot.icon)}
                width={scaledSize}
                style={{
                  filter: `drop-shadow(0 ${scale > 1.15 ? Math.max(2, baseIconSize * 0.05) : Math.max(1, baseIconSize * 0.03)}px ${scale > 1.15 ? Math.max(4, baseIconSize * 0.09) : Math.max(2, baseIconSize * 0.05)}px rgba(0,0,0,${0.15 + (scale - 1) * 0.12}))`,
                }}
              />
              {slot.isOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white/90 shadow dark:bg-white/80"
                  style={{
                    bottom: `${Math.max(-2, -baseIconSize * 0.05)}px`,
                    width: `${Math.max(3, baseIconSize * 0.06)}px`,
                    height: `${Math.max(3, baseIconSize * 0.06)}px`,
                    boxShadow: "0 0 4px rgba(0, 0, 0, 0.25)",
                  }}
                />
              )}
            </>
          );

          const tileStyle: CSSProperties = {
            left: `${position - scaledSize / 2}px`,
            bottom: "0px",
            width: `${scaledSize}px`,
            height: `${scaledSize}px`,
            transformOrigin: "bottom center",
            zIndex: Math.round(scale * 10),
          };

          const tooltip = (
            <span className="dock-tooltip pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800/90 px-2 py-1 text-xs text-white shadow dark:bg-gray-900/95">
              {slot.name}
            </span>
          );

          if (slot.link) {
            return (
              <a
                key={slot.id}
                className="dock-item absolute flex cursor-pointer flex-col items-center justify-end outline-none"
                href={slot.link}
                rel="noreferrer"
                target="_blank"
                ref={(el) => {
                  iconRefs.current[iconIdx] = el;
                }}
                style={tileStyle}
                title={slot.name}
                onClick={() => {
                  const el = iconRefs.current[iconIdx];
                  if (el) createBounceAnimation(el);
                }}
              >
                {tooltip}
                <span className="flex flex-col items-center">{inner}</span>
              </a>
            );
          }

          return (
            <div
              key={slot.id}
              className="dock-item absolute flex cursor-pointer flex-col items-center justify-end outline-none"
              onClick={() => handleIconClick(index, iconIdx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleIconClick(index, iconIdx);
                }
              }}
              ref={(el) => {
                iconRefs.current[iconIdx] = el;
              }}
              role="button"
              tabIndex={0}
              style={tileStyle}
              title={slot.name}
            >
              {tooltip}
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
