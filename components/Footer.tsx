export default function Footer() {
  return (
    <footer className="w-full border-t border-bone/10 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-xs text-muted md:flex-row md:px-10">
        <span className="font-display tracking-[0.2em] text-bone">
          DENNIS GABRIEL
        </span>
        <span>© {new Date().getFullYear()} · Full-Stack Engineer & Designer</span>
        <span className="uppercase tracking-[0.2em]">
          Gebaut mit Next.js · R3F · GSAP
        </span>
      </div>
    </footer>
  );
}
