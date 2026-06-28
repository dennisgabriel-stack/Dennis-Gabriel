"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type Lenis from "lenis";
import Logo from "./Logo";

const links = [
  { label: "Über mich", href: "#about" },
  { label: "Tech-Stack", href: "#stack" },
  { label: "Können", href: "#skills" },
  { label: "Kontakt", href: "#contact" },
];

type Contact = {
  key: "task" | "mail" | "whatsapp" | "phone";
  label: string;
  sub: string;
  href: string;
  accent: string;
  external?: boolean;
};

const CONTACTS: Contact[] = [
  {
    key: "task",
    label: "Projektanfrage",
    sub: "Anfrage für bestimmte Aufgaben",
    href: "mailto:vimode@gmx.de?subject=Projektanfrage%20%E2%80%93%20Aufgabe%20%2F%20Scope",
    accent: "#e6c88a",
  },
  {
    key: "mail",
    label: "E-Mail Anfrage",
    sub: "vimode@gmx.de",
    href: "mailto:vimode@gmx.de",
    accent: "#c9a86a",
  },
  {
    key: "whatsapp",
    label: "WhatsApp Talk",
    sub: "Direkt schreiben · 0170 7332425",
    href: "https://wa.me/491707332425",
    accent: "#bfa779",
    external: true,
  },
  {
    key: "phone",
    label: "Call me",
    sub: "Fragen klären · 0170 7332425",
    href: "tel:+491707332425",
    accent: "#d8b87a",
  },
];

function ContactIcon({ kind }: { kind: Contact["key"] }) {
  const c = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (kind === "task")
    return (
      <svg {...c}>
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 4.5h6V7H9zM8.5 12l2 2 3.5-4" />
      </svg>
    );
  if (kind === "mail")
    return (
      <svg {...c}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  if (kind === "whatsapp")
    return (
      <svg {...c}>
        <path d="M5 19l1.3-3.5A7 7 0 1 1 9 18.5L5 19z" />
        <path d="M9.2 9.4c.2 2.3 3.1 5.2 5.4 5.4.6 0 1.2-.5 1.4-1l-1.6-1-.9.7c-.9-.4-1.8-1.3-2.2-2.2l.7-.9-1-1.6c-.5.2-1 .8-1 1.4z" />
      </svg>
    );
  return (
    <svg {...c}>
      <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2 2A14 14 0 0 1 5 6 2 2 0 0 1 5 4z" />
    </svg>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === "#contact") {
      setMenuOpen(true);
      return;
    }
    const lenis = (window as unknown as { lenis?: Lenis }).lenis;
    if (lenis) lenis.scrollTo(href, { offset: -20, duration: 1.4 });
    else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
          scrolled ? "py-3 glass" : "py-5 bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10">
          <a
            id="brand-logo"
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("replay-intro"));
            }}
            aria-label="ARCHANGEL — Intro neu starten"
            className="flex items-center"
          >
            <Logo className="h-12 md:h-14" />
          </a>
          <ul className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  className="text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-bone"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-full border border-gold/40 px-5 py-2 text-xs uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            Kontakt
          </button>
        </nav>
      </motion.header>

      {/* contact menu — squares unfold one after another */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* backdrop — matches the site (dark + gold glow + blueprint grid) */}
            <button
              aria-label="Schließen"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 cursor-default bg-ink/85 backdrop-blur-md"
            >
              <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(201,168,106,0.12),transparent_60%)]" />
              <span
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(201,168,106,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,106,0.6) 1px,transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />
            </button>

            {/* panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg rounded-3xl border border-gold/15 bg-ink-card/40 p-6 backdrop-blur-xl md:p-8"
              style={{ boxShadow: "0 0 80px rgba(201,168,106,0.10)" }}
            >
              {/* HUD corner brackets */}
              {[
                "left-3 top-3 border-l border-t",
                "right-3 top-3 border-r border-t",
                "left-3 bottom-3 border-l border-b",
                "right-3 bottom-3 border-r border-b",
              ].map((cls) => (
                <span
                  key={cls}
                  className={`pointer-events-none absolute h-5 w-5 border-gold/40 ${cls}`}
                />
              ))}

              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
                    Kontakt
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-bone">
                    Wie starten wir?
                  </h3>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Schließen"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-bone/15 text-muted transition-colors hover:border-gold/50 hover:text-bone"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3.5 md:gap-4">
                {CONTACTS.map((c, i) => (
                  <motion.a
                    key={c.key}
                    href={c.href}
                    {...(c.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, scale: 0.8, y: 16, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      delay: 0.1 + i * 0.09,
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 md:p-5"
                    style={{
                      borderColor: `${c.accent}26`,
                      background: `linear-gradient(155deg, ${c.accent}12, rgba(18,18,22,0.6))`,
                    }}
                  >
                    {/* hover top beam + glow */}
                    <span
                      className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)`,
                      }}
                    />
                    <span
                      className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ boxShadow: `inset 0 0 50px ${c.accent}14, 0 0 36px ${c.accent}1f` }}
                    />

                    <div className="relative flex items-start justify-between">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-300"
                        style={{
                          borderColor: `${c.accent}33`,
                          background: `${c.accent}12`,
                          color: c.accent,
                        }}
                      >
                        <ContactIcon kind={c.key} />
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-muted">
                        0{i + 1}
                      </span>
                    </div>

                    <div className="relative">
                      <div className="font-display text-[17px] font-semibold leading-tight text-bone">
                        {c.label}
                      </div>
                      <div className="mt-1.5 text-[11px] leading-snug text-muted">
                        {c.sub}
                      </div>
                      <span
                        className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium opacity-0 transition-all duration-300 group-hover:opacity-100"
                        style={{ color: c.accent }}
                      >
                        Auswählen
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </div>
                  </motion.a>
                ))}
              </div>

              <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-muted">
                Antwort meist innerhalb von 24 h
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
