"use client";

import dynamic from "next/dynamic";
import Reveal from "./Reveal";

const TransactionFlow = dynamic(() => import("./three/TransactionFlow"), {
  ssr: false,
});

export default function TransactionSection() {
  return (
    <section
      id="onchain"
      className="relative w-full overflow-hidden py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.4em] text-gold">
            On-Chain · Architektur
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-5 max-w-2xl font-display text-4xl font-bold leading-tight md:text-5xl">
            Transaktionswege &{" "}
            <span className="font-serif italic text-gold">Fee-Verteilung</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Jede Transaktion durchläuft die volle Pipeline — Mempool,
            Validierung, Consensus, Execution und Settlement. Security-Gates
            prüfen jeden Wert, abgelehnte Transaktionen fallen heraus, gültige
            werden bestätigt und ihre Fees in 3D verteilt.
          </p>
        </Reveal>
      </div>

      {/* animated 3D network */}
      <div className="relative mt-10 h-[64vh] w-full md:h-[70vh]">
        <TransactionFlow />
        {/* soft edge fades to blend the canvas into the page */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink to-transparent" />
      </div>

      {/* security phase rail */}
      <div className="mx-auto mt-8 max-w-7xl px-6 md:px-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.25em] text-muted">
          {[
            "Mempool",
            "Validierung",
            "Consensus",
            "Execution",
            "Settlement",
          ].map((phase, i) => (
            <span key={phase} className="flex items-center gap-3">
              {i > 0 && <span className="text-gold/40">→</span>}
              <span className="flex items-center gap-2">
                <span className="font-mono text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {phase}
              </span>
            </span>
          ))}
        </div>

        {/* state legend */}
        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs uppercase tracking-widest text-muted">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#6a6a72]" /> Ausstehend
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold" /> Validiert
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-bone" /> Bestätigt
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#c0392b]" /> Abgelehnt
          </span>
        </div>
      </div>
    </section>
  );
}
