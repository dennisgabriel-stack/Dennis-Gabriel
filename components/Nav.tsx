"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type Lenis from "lenis";

const links = [
  { label: "Über mich", href: "#about" },
  { label: "Tech-Stack", href: "#stack" },
  { label: "Können", href: "#skills" },
  { label: "Kontakt", href: "#contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const lenis = (window as unknown as { lenis?: Lenis }).lenis;
    if (lenis) {
      lenis.scrollTo(href, { offset: -20, duration: 1.4 });
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
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
          href="#top"
          onClick={(e) => go(e, "#top")}
          className="font-display text-sm font-bold tracking-[0.25em] text-bone"
        >
          DG<span className="text-gold">.</span>
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
        <a
          href="#contact"
          onClick={(e) => go(e, "#contact")}
          className="rounded-full border border-gold/40 px-5 py-2 text-xs uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-ink"
        >
          Kontakt
        </a>
      </nav>
    </motion.header>
  );
}
