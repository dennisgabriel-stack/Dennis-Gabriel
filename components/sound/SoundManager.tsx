"use client";

import { useEffect, useRef, useState } from "react";

/* ---- synthesized impulse response for a vast, divine reverb ---- */
function makeImpulse(ctx: AudioContext, seconds: number, decay: number) {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

type Engine = {
  ctx: AudioContext;
  master: GainNode;
  reverb: ConvolverNode;
  reverbGain: GainNode;
  pad?: { gain: GainNode; stop: () => void };
};

export default function SoundManager() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const eng = useRef<Engine | null>(null);
  const lastHover = useRef(0);

  /* lazily build the audio graph on first user gesture */
  const ensure = (): Engine => {
    if (eng.current) return eng.current;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(ctx, 4.5, 2.6);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.55;
    reverb.connect(reverbGain);
    reverbGain.connect(master);

    eng.current = { ctx, master, reverb, reverbGain };
    return eng.current;
  };

  /* a single voice routed dry + into the cathedral reverb */
  const voice = (
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    when = 0,
    detune = 0
  ) => {
    const e = eng.current;
    if (!e) return;
    const t = e.ctx.currentTime + when;
    const osc = e.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const g = e.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(e.master);
    g.connect(e.reverb);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  };

  /* divine majestic chime — stacked harmonics */
  const chime = (base: number, vol: number) => {
    voice(base, 1.6, "triangle", vol, 0, -4);
    voice(base * 1.5, 1.4, "sine", vol * 0.6, 0.04);
    voice(base * 2, 1.2, "sine", vol * 0.4, 0.08);
  };

  const playHover = () => {
    const now = performance.now();
    if (now - lastHover.current < 70) return;
    lastHover.current = now;
    voice(1567.98, 0.4, "sine", 0.05); // G6 shimmer
    voice(2093.0, 0.35, "sine", 0.03, 0.03);
  };

  const playClick = () => chime(659.25, 0.08); // E5 majestic chime

  /* a low, glorious swell when the cathedral opens */
  const playEnter = () => {
    chime(523.25, 0.09);
    voice(130.81, 2.8, "sine", 0.12, 0); // deep C3 boom
    voice(196.0, 2.6, "triangle", 0.07, 0.05);
  };

  const startPad = () => {
    const e = ensure();
    if (e.pad) return;
    const padGain = e.ctx.createGain();
    padGain.gain.value = 0;
    const filter = e.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.Q.value = 0.7;
    filter.connect(padGain);
    padGain.connect(e.master);
    padGain.connect(e.reverb);

    // slow filter breathing
    const lfo = e.ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = e.ctx.createGain();
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // A-major lush chord with octaves + soft detune for a celestial pad
    const freqs = [110, 164.81, 220, 277.18, 329.63, 440];
    const oscs: OscillatorNode[] = [];
    freqs.forEach((f, i) => {
      [-6, 6].forEach((d) => {
        const o = e.ctx.createOscillator();
        o.type = i < 2 ? "sine" : "triangle";
        o.frequency.value = f;
        o.detune.value = d;
        const og = e.ctx.createGain();
        og.gain.value = (i < 2 ? 0.5 : 0.28) / 2;
        o.connect(og);
        og.connect(filter);
        o.start();
        oscs.push(o);
      });
    });

    padGain.gain.linearRampToValueAtTime(0.14, e.ctx.currentTime + 5);
    e.pad = {
      gain: padGain,
      stop: () => {
        oscs.forEach((o) => o.stop());
        lfo.stop();
      },
    };
  };

  const toggle = async () => {
    const e = ensure();
    if (e.ctx.state === "suspended") await e.ctx.resume();
    setReady(true);
    if (!enabled) {
      e.master.gain.cancelScheduledValues(e.ctx.currentTime);
      e.master.gain.linearRampToValueAtTime(0.9, e.ctx.currentTime + 1.5);
      startPad();
      playEnter();
      setEnabled(true);
    } else {
      e.master.gain.linearRampToValueAtTime(0.0001, e.ctx.currentTime + 0.8);
      setEnabled(false);
    }
  };

  /* global UI sound delegation + custom events from the 3D scene */
  useEffect(() => {
    if (!enabled) return;
    const over = (ev: Event) => {
      const t = ev.target as HTMLElement;
      if (t?.closest?.("a,button,[data-sound]")) playHover();
    };
    const click = (ev: Event) => {
      const t = ev.target as HTMLElement;
      if (t?.closest?.("a,button,[data-sound]")) playClick();
    };
    const onHover = () => playHover();
    const onClick = () => playClick();
    window.addEventListener("pointerover", over);
    window.addEventListener("click", click);
    window.addEventListener("ux-hover", onHover);
    window.addEventListener("ux-click", onClick);
    return () => {
      window.removeEventListener("pointerover", over);
      window.removeEventListener("click", click);
      window.removeEventListener("ux-hover", onHover);
      window.removeEventListener("ux-click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? "Sound ausschalten" : "Sound einschalten"}
      className="group fixed bottom-6 right-6 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-ink/70 backdrop-blur-md transition-all duration-300 hover:border-gold hover:scale-105"
    >
      {/* pulsing invite ring when off */}
      {!ready && (
        <span className="absolute inset-0 animate-ping rounded-full border border-gold/40" />
      )}
      {enabled ? (
        <span className="flex items-end gap-[3px]">
          {[10, 16, 8, 14].map((h, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-gold"
              style={{
                height: h,
                animation: `eq 0.8s ${i * 0.12}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </span>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gold"
        >
          <path
            d="M4 9v6h4l5 4V5L8 9H4z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M16 9c1.5 1 1.5 5 0 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
      <style jsx>{`
        @keyframes eq {
          from {
            transform: scaleY(0.4);
          }
          to {
            transform: scaleY(1);
          }
        }
      `}</style>
    </button>
  );
}
