"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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
  noise: AudioBuffer;
  pad?: { gain: GainNode; stop: () => void };
};

export default function SoundManager() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const eng = useRef<Engine | null>(null);
  const lastHover = useRef(0);
  const enabledRef = useRef(false);
  // label phases: 0 none · 1 type-in (terminal) · 2 rotate 90° · 3 slide into icon
  const [labelPhase, setLabelPhase] = useState(0);
  const firstRun = useRef(true);
  useEffect(() => {
    enabledRef.current = enabled;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setLabelPhase(1);
    const timers = [
      setTimeout(() => setLabelPhase(2), 1000),
      setTimeout(() => setLabelPhase(3), 1550),
      setTimeout(() => setLabelPhase(0), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [enabled]);

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

    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    eng.current = { ctx, master, reverb, reverbGain, noise };
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

  /* woosh — filtered noise sweep, for flying through layers */
  const playWoosh = () => {
    const e = eng.current;
    if (!e) return;
    const t = e.ctx.currentTime;
    const src = e.ctx.createBufferSource();
    src.buffer = e.noise;
    src.loop = true;
    const bp = e.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.3;
    bp.frequency.setValueAtTime(320, t);
    bp.frequency.exponentialRampToValueAtTime(3400, t + 0.42);
    const g = e.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.2, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    src.connect(bp);
    bp.connect(g);
    g.connect(e.master);
    g.connect(e.reverb);
    src.start(t);
    src.stop(t + 0.7);
  };

  /* crystalline cluster burst for taps */
  const playBurst = () => {
    [1046.5, 1318.51, 1567.98, 2093.0].forEach((f, i) =>
      voice(f, 0.22, "sine", 0.055, i * 0.022)
    );
    voice(523.25, 0.32, "triangle", 0.05);
  };

  /* throttle gate per sound key */
  const tl = useRef<Record<string, number>>({});
  const gate = (k: string, ms: number) => {
    const n = performance.now();
    if (n - (tl.current[k] || 0) < ms) return false;
    tl.current[k] = n;
    return true;
  };

  /* soft rising swell when text appears */
  const playTextIn = () => {
    if (!gate("ti", 90)) return;
    voice(880, 0.5, "sine", 0.04); // A5
    voice(1174.66, 0.6, "sine", 0.028, 0.07); // D6
  };

  /* gentle falling tone when text leaves */
  const playTextOut = () => {
    if (!gate("to", 90)) return;
    voice(659.25, 0.45, "sine", 0.032); // E5
    voice(440, 0.55, "sine", 0.022, 0.06); // A4
  };

  /* soft snap as a cube forms / locks in */
  const playBlock = () => {
    if (!gate("bl", 45)) return;
    voice(330, 0.14, "triangle", 0.05);
    voice(880, 0.1, "sine", 0.03, 0.005);
  };

  /* hard "klack" — cube snapping into place */
  const playKlack = () => {
    const e = eng.current;
    if (!e) return;
    // sharp pitched transient + body
    voice(2300, 0.04, "square", 0.05);
    voice(440, 0.16, "triangle", 0.08, 0.006);
    voice(180, 0.22, "sine", 0.05, 0.006);
    // noise click
    const t = e.ctx.currentTime;
    const src = e.ctx.createBufferSource();
    src.buffer = e.noise;
    const hp = e.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1400;
    const g = e.ctx.createGain();
    g.gain.setValueAtTime(0.14, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    src.connect(hp);
    hp.connect(g);
    g.connect(e.master);
    g.connect(e.reverb);
    src.start(t);
    src.stop(t + 0.1);
  };

  /* crisp detent tick for the rotary dial */
  const playTick = () => {
    if (!gate("tk", 28)) return;
    voice(1480, 0.05, "square", 0.022);
    voice(740, 0.06, "sine", 0.02, 0.002);
  };

  /* a low, glorious swell when the cathedral opens */
  const playEnter = () => {
    chime(523.25, 0.09);
    voice(130.81, 2.8, "sine", 0.12, 0); // deep C3 boom
    voice(196.0, 2.6, "triangle", 0.07, 0.05);
  };

  /* watery "swimming pool" ambience for the loading screen */
  const playPool = () => {
    const e = eng.current;
    if (!e) return;
    const t = e.ctx.currentTime;
    // water wash — filtered noise with a slow shimmering lowpass
    const src = e.ctx.createBufferSource();
    src.buffer = e.noise;
    src.loop = true;
    const lp = e.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 600;
    lp.Q.value = 5;
    const lfo = e.ctx.createOscillator();
    lfo.frequency.value = 0.35;
    const lfoGain = e.ctx.createGain();
    lfoGain.gain.value = 380;
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);
    const g = e.ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.13, t + 1.6);
    g.gain.linearRampToValueAtTime(0.09, t + 4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 6.5);
    src.connect(lp);
    lp.connect(g);
    g.connect(e.master);
    g.connect(e.reverb);
    lfo.start(t);
    src.start(t);
    src.stop(t + 7);
    lfo.stop(t + 7);
    // muffled underwater tone + soft drips
    voice(174.61, 4.5, "sine", 0.05, 0.1);
    voice(261.63, 4, "sine", 0.03, 0.4);
    [0.7, 1.6, 2.8, 4.1].forEach((d, i) =>
      voice(880 + i * 130, 0.16, "sine", 0.03, d)
    );
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

  // turn sound ON; returns false if the browser is still blocking audio
  const enable = async (): Promise<boolean> => {
    const e = ensure();
    try {
      if (e.ctx.state === "suspended") await e.ctx.resume();
    } catch {
      /* ignore */
    }
    if (e.ctx.state !== "running") return false; // wait for a real gesture
    setReady(true);
    if (enabledRef.current) return true;
    enabledRef.current = true;
    e.master.gain.cancelScheduledValues(e.ctx.currentTime);
    e.master.gain.linearRampToValueAtTime(0.9, e.ctx.currentTime + 1.5);
    startPad();
    // during the loading screen → watery pool ambience; afterwards → the swell
    if (performance.now() < 8000) playPool();
    else playEnter();
    setEnabled(true);
    return true;
  };

  const toggle = async () => {
    if (!enabledRef.current) {
      await enable();
      return;
    }
    const e = ensure();
    e.master.gain.linearRampToValueAtTime(0.0001, e.ctx.currentTime + 0.8);
    enabledRef.current = false;
    setEnabled(false);
  };

  // auto-enable sound as soon as possible: try immediately (some desktop
  // browsers allow it), otherwise on the visitor's very first interaction
  useEffect(() => {
    let done = false;
    const tryEnable = async () => {
      if (done) return;
      const ok = await enable();
      if (ok) {
        done = true;
        remove();
      }
    };
    const opts: AddEventListenerOptions = { passive: true };
    const remove = () => {
      window.removeEventListener("pointerdown", tryEnable);
      window.removeEventListener("keydown", tryEnable);
      window.removeEventListener("touchstart", tryEnable);
      window.removeEventListener("scroll", tryEnable);
    };
    window.addEventListener("pointerdown", tryEnable, opts);
    window.addEventListener("keydown", tryEnable, opts);
    window.addEventListener("touchstart", tryEnable, opts);
    window.addEventListener("scroll", tryEnable, opts);
    tryEnable();
    return remove;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const onWoosh = () => playWoosh();
    const onBurst = () => playBurst();
    const onTextIn = () => playTextIn();
    const onTextOut = () => playTextOut();
    const onBlock = () => playBlock();
    const onTick = () => playTick();
    const onKlack = () => playKlack();
    window.addEventListener("pointerover", over);
    window.addEventListener("click", click);
    window.addEventListener("ux-hover", onHover);
    window.addEventListener("ux-click", onClick);
    window.addEventListener("ux-woosh", onWoosh);
    window.addEventListener("ux-burst", onBurst);
    window.addEventListener("ux-textin", onTextIn);
    window.addEventListener("ux-textout", onTextOut);
    window.addEventListener("ux-block", onBlock);
    window.addEventListener("ux-tick", onTick);
    window.addEventListener("ux-klack", onKlack);
    return () => {
      window.removeEventListener("pointerover", over);
      window.removeEventListener("click", click);
      window.removeEventListener("ux-hover", onHover);
      window.removeEventListener("ux-click", onClick);
      window.removeEventListener("ux-woosh", onWoosh);
      window.removeEventListener("ux-burst", onBurst);
      window.removeEventListener("ux-textin", onTextIn);
      window.removeEventListener("ux-textout", onTextOut);
      window.removeEventListener("ux-block", onBlock);
      window.removeEventListener("ux-tick", onTick);
      window.removeEventListener("ux-klack", onKlack);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return (
    <>
      {/* terminal label: types in sideways → each letter rotates 90° → slides down into the icon */}
      {labelPhase > 0 &&
        (() => {
          const chars = ("Sound " + (enabled ? "on" : "off")).split("");
          const N = chars.length;
          const LH = 13; // vertical line spacing
          return (
            <div className="pointer-events-none fixed bottom-12 right-12 z-[69]">
              {chars.map((ch, i) => {
                // stacked vertically, clearing the icon (i=0 on top, last above icon)
                const colY = -((N - 1 - i) * LH + 52);
                const target =
                  labelPhase === 1
                    ? { x: -3, y: colY, rotate: 0, opacity: 1 }
                    : labelPhase === 2
                    ? { x: -3, y: colY, rotate: 90, opacity: 1 }
                    : { x: 0, y: 0, rotate: 90, opacity: 0 };
                return (
                  <motion.span
                    key={i}
                    className="absolute left-0 top-0 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-gold"
                    style={{ textShadow: "0 0 8px rgba(201,168,106,0.55)" }}
                    initial={{ x: -3, y: colY - 4, rotate: 0, opacity: 0 }}
                    animate={target}
                    transition={
                      labelPhase === 1
                        ? { duration: 0.22, delay: i * 0.05, ease: "easeOut" }
                        : labelPhase === 2
                        ? { duration: 0.4, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }
                        : { duration: 0.5, delay: i * 0.04, ease: "easeIn" }
                    }
                  >
                    {ch === " " ? " " : ch}
                  </motion.span>
                );
              })}
            </div>
          );
        })()}

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
    </>
  );
}
