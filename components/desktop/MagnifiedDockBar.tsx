"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useDark } from "@/hooks/useDark";

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
      return { baseIconSize: 64, maxScale: 1.6, effectWidth: 240 };
    }

    const smallerDimension = Math.min(window.innerWidth, window.innerHeight);

    if (smallerDimension < 480) {
      return {
        baseIconSize: Math.max(40, smallerDimension * 0.08),
        maxScale: 1.4,
        effectWidth: smallerDimension * 0.4,
      };
    }
    if (smallerDimension < 768) {
      return {
        baseIconSize: Math.max(48, smallerDimension * 0.07),
        maxScale: 1.5,
        effectWidth: smallerDimension * 0.35,
      };
    }
    if (smallerDimension < 1024) {
      return {
        baseIconSize: Math.max(56, smallerDimension * 0.06),
        maxScale: 1.6,
        effectWidth: smallerDimension * 0.3,
      };
    }
    return {
      baseIconSize: Math.max(64, Math.min(80, smallerDimension * 0.05)),
      maxScale: 1.8,
      effectWidth: 300,
    };
  }, []);

  const [config, setConfig] = useState(getResponsiveConfig);
  const { baseIconSize, maxScale, effectWidth } = config;
  const dark = useDark();
  const minScale = 1;
  const baseSpacing = Math.max(4, baseIconSize * 0.08);
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

  /**
   * Same cosine lens as the reference MacOSDock. Lens centers use unscaled slot widths
   * (including separators) along X—same idea as a uniform icon grid, but fits
   * Launchpad | divider | apps.
   */
  const calculateTargetMagnification = useCallback(
    (mousePosition: number | null) => {
      if (mousePosition === null) {
        return slots.map(() => minScale);
      }

      let x = 0;
      return slots.map((slot) => {
        if (slot.kind === "separator") {
          x += sepWidth + baseSpacing;
          return minScale;
        }

        const normalIconCenter = x + baseIconSize / 2;
        x += baseIconSize + baseSpacing;

        const minX = mousePosition - effectWidth / 2;
        const maxX = mousePosition + effectWidth / 2;

        if (normalIconCenter < minX || normalIconCenter > maxX) {
          return minScale;
        }

        const theta = ((normalIconCenter - minX) / effectWidth) * 2 * Math.PI;
        const cappedTheta = Math.min(Math.max(theta, 0), 2 * Math.PI);
        const scaleFactor = (1 - Math.cos(cappedTheta)) / 2;

        return minScale + scaleFactor * (maxScale - minScale);
      });
    },
    [
      slots,
      baseIconSize,
      baseSpacing,
      sepWidth,
      effectWidth,
      maxScale,
      minScale,
    ],
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
    const targetScales = calculateTargetMagnification(mouseX);
    const lerpFactor = mouseX !== null ? 0.2 : 0.12;

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
      (scale, index) => Math.abs(scale - targetScales[index]) > 0.002,
    );
    const positionsNeedUpdate = nextPositions.some(
      (pos, index) => Math.abs(pos - targetPositions[index]) > 0.1,
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
    const bounceHeight = Math.max(-8, -baseIconSize * 0.15);
    element.style.transition = "transform 0.2s ease-out";
    element.style.transform = `translateY(${bounceHeight}px)`;
    window.setTimeout(() => {
      element.style.transform = "translateY(0px)";
    }, 200);
  };

  const bounceIcon = (iconIdx: number, scale: number) => {
    const el = iconRefs.current[iconIdx];
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      (window as unknown as { gsap?: unknown }).gsap
    ) {
      const gsap = (
        window as unknown as {
          gsap: { to: (t: HTMLElement, o: object) => void };
        }
      ).gsap;
      const bounceHeight =
        scale > 1.3 ? -baseIconSize * 0.2 : -baseIconSize * 0.15;
      gsap.to(el, {
        y: bounceHeight,
        duration: 0.2,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
        transformOrigin: "bottom center",
      });
    } else {
      createBounceAnimation(el);
    }
  };

  const handleIconClick = (slotIndex: number, iconIdx: number) => {
    const slot = slots[slotIndex];
    if (slot.kind !== "icon") return;

    const scale = currentScales[slotIndex] ?? 1;
    bounceIcon(iconIdx, scale);
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

  const dockShellStyle = useMemo((): CSSProperties => {
    const radius = `${Math.max(12, baseIconSize * 0.4)}px`;
    const y1 = Math.max(4, baseIconSize * 0.1);
    const blur1 = Math.max(16, baseIconSize * 0.4);
    const y2 = Math.max(2, baseIconSize * 0.05);
    const blur2 = Math.max(8, baseIconSize * 0.2);

    if (dark) {
      return {
        borderRadius: radius,
        background: "rgba(45, 45, 45, 0.25)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      };
    }

    return {
      borderRadius: radius,
      background: "rgba(255, 255, 255, 0.25)",
      border: "1px solid rgba(255, 255, 255, 0.72)",
    };
  }, [dark, baseIconSize]);

  return (
    <div
      className={cn("overflow-visible backdrop-blur-md", className)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={dockRef}
      style={{
        width: `${contentWidth + padding * 2}px`,
        ...dockShellStyle,
        padding: `${padding}px`,
      }}
    >
      {/* MacOSDock-style track: fixed to baseIconSize; magnified icons overflow upward */}
      <div
        className="relative overflow-visible"
        style={{
          height: `${baseIconSize}px`,
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
                <div
                  className={cn(
                    "h-9 w-px rounded-full",
                    dark ? "bg-white/25" : "bg-black/18",
                  )}
                />
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
                  filter: `drop-shadow(0 ${scale > 1.2 ? Math.max(2, baseIconSize * 0.05) : Math.max(1, baseIconSize * 0.03)}px ${scale > 1.2 ? Math.max(4, baseIconSize * 0.1) : Math.max(2, baseIconSize * 0.06)}px rgba(0,0,0,${dark ? 0.2 + (scale - 1) * 0.15 : 0.14 + (scale - 1) * 0.1}))`,
                }}
              />
              {slot.isOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    bottom: `${Math.max(-2, -baseIconSize * 0.05)}px`,
                    width: `${Math.max(3, baseIconSize * 0.06)}px`,
                    height: `${Math.max(3, baseIconSize * 0.06)}px`,
                    backgroundColor: dark
                      ? "rgba(255, 255, 255, 0.85)"
                      : "rgba(30, 30, 30, 0.62)",
                    boxShadow: dark
                      ? "0 0 4px rgba(0, 0, 0, 0.35)"
                      : "0 0 3px rgba(255, 255, 255, 0.5)",
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
            <span className="dock-tooltip pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white shadow">
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
                  bounceIcon(iconIdx, currentScales[index] ?? 1);
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
