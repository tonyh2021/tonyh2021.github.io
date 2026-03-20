'use client';

import { useRef, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useMobile } from '@/hooks/useMobile';

// ─── Distance-based magnification ─────────────────────────────────────────────
// Mirrors playground-macos/src/components/dock/DockItem.tsx
function useDockHoverAnimation(
  mouseX: MotionValue<number | null>,
  ref: React.RefObject<HTMLImageElement>,
  dockSize: number,
  dockMag: number,
) {
  const limit = dockSize * 6;

  const distanceInput = [
    -limit,
    -limit / (dockMag * 0.65),
    -limit / (dockMag * 0.85),
    0,
    limit / (dockMag * 0.85),
    limit / (dockMag * 0.65),
    limit,
  ];
  const widthOutput = [
    dockSize,
    dockSize * dockMag * 0.55,
    dockSize * dockMag * 0.75,
    dockSize * dockMag,
    dockSize * dockMag * 0.75,
    dockSize * dockMag * 0.55,
    dockSize,
  ];

  const distance = useMotionValue(limit + 1);

  const widthPx = useSpring(useTransform(distance, distanceInput, widthOutput), {
    stiffness: 1700,
    damping: 90,
  });

  const width = useTransform(widthPx, (w) => `${w / 16}rem`);

  useEffect(() => {
    if (mouseX === null) return; // mobile: skip rAF loop entirely
    let raf: number;
    const loop = () => {
      const el = ref.current;
      const mx = mouseX.get();
      if (el && mx !== null) {
        const rect = el.getBoundingClientRect();
        distance.set(mx - (rect.left + rect.width / 2));
      } else {
        distance.set(limit + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mouseX, ref, distance, limit]);

  return { width, widthPx };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  id: string;
  title: string;
  img: string;
  desktop: boolean;
  link?: string;
  isOpen: boolean;
  openApp: () => void;
  mouseX: MotionValue<number | null>;
  dockSize: number;
  dockMag: number;
}

export default function DockItem({
  id, title, img, desktop, link, isOpen, openApp,
  mouseX, dockSize, dockMag,
}: Props) {
  const isMobile = useMobile();
  const imgRef = useRef<HTMLImageElement>(null);
  const { width } = useDockHoverAnimation(mouseX, imgRef, dockSize, dockMag);

  // Mobile: plain static icon, no motion/animation
  if (isMobile) {
    const iconEl = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={img}
        alt={title}
        draggable={false}
        style={{ width: dockSize, height: dockSize }}
        className="object-contain"
      />
    );
    return (
      <li
        id={`dock-${id}`}
        className="relative flex flex-col items-center justify-end mb-1"
        onClick={desktop || id === 'launchpad' ? openApp : undefined}
      >
        {link ? <a href={link} target="_blank" rel="noreferrer">{iconEl}</a> : iconEl}
        <div className={`w-1 h-1 mt-0.5 rounded-full bg-white/80 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      </li>
    );
  }

  // Desktop: magnification animation
  const imgEl = (
    <motion.img
      ref={imgRef}
      src={img}
      alt={title}
      title={title}
      draggable={false}
      style={{ width, willChange: 'width' }}
    />
  );

  return (
    <li
      id={`dock-${id}`}
      className="dock-item relative flex flex-col justify-end mb-1"
      onClick={desktop || id === 'launchpad' ? openApp : undefined}
    >
      {/* Tooltip */}
      <span className="dock-tooltip absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-gray-800/90 text-white px-2 py-1 rounded-md pointer-events-none shadow z-10">
        {title}
      </span>

      {link ? (
        <a href={link} target="_blank" rel="noreferrer">
          {imgEl}
        </a>
      ) : (
        imgEl
      )}

      {/* Open-indicator dot */}
      <div
        className={`w-1 h-1 mx-auto rounded-full bg-white/80 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </li>
  );
}
