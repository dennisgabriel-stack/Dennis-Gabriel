import Link from "next/link";

const SOCIALS = [
  { label: "X", href: "https://x.com/solairetrades?s=11" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/dagles27?igsh=Z24wY2d6cndvNTY3&utm_source=qr",
  },
  { label: "E-Mail", href: "mailto:vimode@gmx.de" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-bone/10 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 text-xs text-muted md:flex-row md:justify-between md:px-10">
        <span className="font-display tracking-[0.2em] text-bone">
          DENNIS GABRIEL
        </span>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 uppercase tracking-[0.2em]">
          {SOCIALS.map((s) => {
            const external = s.href.startsWith("http");
            return (
              <a
                key={s.label}
                href={s.href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="transition-colors hover:text-bone"
              >
                {s.label}
              </a>
            );
          })}
          <Link href="/impressum" className="transition-colors hover:text-bone">
            Impressum
          </Link>
          <Link href="/datenschutz" className="transition-colors hover:text-bone">
            Datenschutz
          </Link>
        </div>

        <span>© {new Date().getFullYear()} · ARCHANGEL//DEV</span>
      </div>
    </footer>
  );
}
