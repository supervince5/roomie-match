import { useEffect, useRef, useState } from "react";

// Synthesized locally: quiet envelopes, no downloads or third-party audio.
export function useDiscoverSound() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem("roomie.discover.sound") !== "off";
    } catch {
      return true;
    }
  });
  const enabledRef = useRef(enabled);
  const context = useRef<AudioContext | null>(null);
  useEffect(
    () => () => {
      void context.current?.close().catch(() => {});
      context.current = null;
    },
    [],
  );
  function prime() {
    if (!enabledRef.current) return;
    try {
      context.current ??= new AudioContext();
      if (context.current.state === "suspended")
        void context.current.resume().catch(() => {});
    } catch {
      /* Sound is optional; a blocked audio context must not block a swipe. */
    }
  }
  function toggle() {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    try {
      localStorage.setItem("roomie.discover.sound", next ? "on" : "off");
    } catch {
      /* Session preference still works. */
    }
    if (next) prime();
  }
  async function play(kind: "pass" | "match") {
    if (!enabledRef.current) return;
    const ctx = context.current;
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try { await ctx.resume(); } catch { return; }
    }
    if (!enabledRef.current || context.current !== ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    if (kind === "pass") {
      const length = Math.floor(ctx.sampleRate * 0.24);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      source.buffer = buffer;
      filter.type = "bandpass";
      filter.Q.value = 0.65;
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.24);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      source.start(now);
      source.stop(now + 0.25);
    } else {
      [523.25, 659.25, 783.99].forEach((frequency, i) => {
        const tone = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + i * 0.09;
        tone.type = "sine";
        tone.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.045, start + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.52);
        tone.connect(gain).connect(ctx.destination);
        tone.onended = () => {
          tone.disconnect();
          gain.disconnect();
        };
        tone.start(start);
        tone.stop(start + 0.54);
      });
    }
  }
  return { enabled, toggle, prime, play };
}
