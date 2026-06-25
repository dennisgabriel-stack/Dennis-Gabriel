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
            Wallets fließen durch Smart-Contract-Pipelines, werden geroutet und
            an jedem Knoten in Anteile zerlegt — Treasury, Validatoren, Pool und
            Burn. Echtzeit-Wertströme, sichtbar gemacht.
          </p>
        </Reveal>
      </div>

      {/* animated network */}
      <div className="relative mt-10 h-[58vh] w-full md:h-[62vh]">
        <TransactionFlow />
        {/* soft edge fades to blend the canvas into the page */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
      </div>

      {/* legend */}
      <div className="mx-auto mt-6 flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-6 text-xs uppercase tracking-widest text-muted md:px-10">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-bone" /> Transaktion
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gold" /> Fee-Anteil
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rotate-45 bg-bone" /> Contract / Router
        </span>
      </div>
    </section>
  );
}
