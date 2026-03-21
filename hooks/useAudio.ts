"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";

export interface AudioState {
  volume: number;
  playing: boolean;
}

/**
 * Lazily creates the HTMLAudioElement on first play so the MP3 is not fetched until needed.
 * Volume changes before playback only update UI state / a ref (no network).
 */
export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndedRef = useRef<(() => void) | null>(null);
  const desiredVolumeRef = useRef(1);
  const [state, setState] = useState<AudioState>({ volume: 1, playing: false });

  const disposeAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = onEndedRef.current;
    if (onEnded) {
      audio.removeEventListener("ended", onEnded);
      onEndedRef.current = null;
    }
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audioRef.current = null;
  }, []);

  const ensureAudio = useCallback((): HTMLAudioElement | null => {
    if (!src) return null;
    if (audioRef.current) return audioRef.current;

    const audio = new Audio();
    audio.preload = "none";
    audio.src = src;
    audio.volume = desiredVolumeRef.current;

    const onEnded = () => {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    };
    onEndedRef.current = onEnded;
    audio.addEventListener("ended", onEnded);

    audioRef.current = audio;
    return audio;
  }, [src]);

  useEffect(() => {
    return () => {
      disposeAudio();
    };
  }, [src, disposeAudio]);

  const controls = useMemo(
    () => ({
      play: () => {
        const audio = ensureAudio();
        if (!audio) return;
        void audio.play().catch(() => {});
        setState((s) => ({ ...s, playing: true }));
      },
      pause: () => {
        audioRef.current?.pause();
        setState((s) => ({ ...s, playing: false }));
      },
      toggle: () => {
        setState((s) => {
          if (s.playing) {
            audioRef.current?.pause();
            return { ...s, playing: false };
          }
          const audio = ensureAudio();
          if (audio) void audio.play().catch(() => {});
          return { ...s, playing: !!audio };
        });
      },
      setVolume: (v: number) => {
        v = Math.min(1, Math.max(0, v));
        desiredVolumeRef.current = v;
        const audio = audioRef.current;
        if (audio) audio.volume = v;
        setState((s) => ({ ...s, volume: v }));
      },
    }),
    [ensureAudio],
  );

  return { state, controls };
}
