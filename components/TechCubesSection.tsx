"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Reveal from "./Reveal";

const TechCubes = dynamic(() => import("./three/TechCubes"), { ssr: false });

export default function TechCubesSection() {
  return (
    <section
      id="stack-3d"
      className="relative w-full overflow-hidden py-24 md:py-32"
    >
      {/* portrait behind the text — right half visible, fading off to the left */}
      <div className="pointer-events-none absolute right-0 top-0 z-0 h-[72%] w-full md:w-[70%]">
        <Image
          src="/images/stack-bg.jpeg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-right opacity-60"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-ink/55 to-ink" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ink to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.4em] text-gold">
            Live-Architektur
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-5 max-w-2xl font-display text-4xl font-bold leading-tight md:text-5xl">
            Mein Stack,{" "}
            <span className="font-serif italic text-gold">in Bewegung</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Jeder Block ist ein Werkzeug. Sie fügen sich zusammen, bauen sich um
            und lassen sich frei umkreisen — meine komplette aktuelle
            Tech-Kenntnis als lebende 3D-Architektur.
          </p>
        </Reveal>
      </div>

      <div className="relative mt-8 h-[68vh] w-full md:h-[74vh]">
        <TechCubes />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink to-transparent" />
      </div>
    </section>
  );
}
