"use client";

import { useRef, useState, useEffect } from "react";

export interface AudioState {
  volume: number;
  playing: boolean;
}

export function useAudio(src: string) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({ volume: 1, playing: false });

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    ref.current = audio;

    const onEnded = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, [src]);

  const controls = {
    play: () => {
      ref.current?.play().catch(() => {});
      setState((s) => ({ ...s, playing: true }));
    },
    pause: () => {
      ref.current?.pause();
      setState((s) => ({ ...s, playing: false }));
    },
    toggle: () => {
      if (state.playing) controls.pause();
      else controls.play();
    },
    setVolume: (v: number) => {
      v = Math.min(1, Math.max(0, v));
      if (ref.current) ref.current.volume = v;
      setState((s) => ({ ...s, volume: v }));
    },
  };

  return { state, controls };
}
