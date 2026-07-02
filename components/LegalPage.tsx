import Link from "next/link";
import Image from "next/image";
import Footer from "./Footer";

export default function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-ink text-bone">
      {/* ambient background — matches the site */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(201,168,106,0.10),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,106,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,106,0.5) 1px,transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
      </div>

      {/* top bar */}
      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-6 py-6 md:px-8">
        <Link href="/" className="flex items-center" aria-label="Zur Startseite">
          <Image
            src="/images/logo.png"
            alt="ARCHANGEL"
            width={1158}
            height={813}
            className="h-10 w-auto md:h-12"
          />
        </Link>
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-bone"
        >
          ← Startseite
        </Link>
      </header>

      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-6 md:px-8">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">{eyebrow}</p>
        <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-6xl">
          {title}
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
          Stand: {updated}
        </p>

        <div className="mt-10 [&_a]:text-gold [&_a]:underline-offset-2 hover:[&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-bone [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-bone/90 [&_li]:mt-1 [&_p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted [&_strong]:text-bone [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:leading-relaxed [&_ul]:text-muted">
          {children}
        </div>
      </div>

      <Footer />
    </main>
  );
}
