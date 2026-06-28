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
  external?: boolean;
};

const CONTACTS: Contact[] = [
  {
    key: "task",
    label: "Anfrage für bestimmte Aufgaben",
    sub: "Projekt & Aufgaben",
    href: "mailto:vimode@gmx.de?subject=Anfrage%20%E2%80%93%20Projekt%20%2F%20Aufgabe",
  },
  {
    key: "mail",
    label: "Email Anfrage",
    sub: "vimode@gmx.de",
    href: "mailto:vimode@gmx.de",
  },
  {
    key: "whatsapp",
    label: "WhatsApp Talk",
    sub: "0170 7332425",
    href: "https://wa.me/491707332425",
    external: true,
  },
  {
    key: "phone",
    label: "Call me for questions",
    sub: "0170 7332425",
    href: "tel:+491707332425",
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
            className="fixed inset-0 z-[80] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0 bg-ink/85 backdrop-blur-md"
              onClick={() => setMenuOpen(false)}
            />
            <div className="relative w-full max-w-lg">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.4em] text-gold">
                  Kontakt
                </p>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Schließen"
                  className="text-xl text-muted transition-colors hover:text-bone"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {CONTACTS.map((c, i) => (
                  <motion.a
                    key={c.key}
                    href={c.href}
                    {...(c.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, scale: 0.85, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      delay: i * 0.08,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border border-gold/25 bg-ink-card/70 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_0_40px_rgba(201,168,106,0.18)]"
                  >
                    <span className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-transparent via-gold to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                      <ContactIcon kind={c.key} />
                    </span>
                    <div>
                      <div className="font-display text-base font-semibold leading-snug text-bone">
                        {c.label}
                      </div>
                      <div className="mt-1 text-xs text-muted">{c.sub}</div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
