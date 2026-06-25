# Dennis Gabriel — Portfolio

Cinematische Portfolio-Website / digitale Visitenkarte.
Full-Stack & Blockchain Developer · KI · Automatisierung · Grafik-Design.

## Tech-Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** — Styling & Design-System
- **React Three Fiber** (Three.js) — 3D-Partikelszene
- **GSAP** + **Lenis** — cinematisches, butterweiches Scrollen
- **Framer Motion** — Reveal- & Micro-Animationen

## Lokal starten

```bash
npm install
npm run dev
```

Öffnet `http://localhost:3000`.

## Deployment

Gekoppelt mit **Vercel** — jeder Push auf den Branch wird automatisch deployed.

## Struktur

```
app/            Layout, globale Styles, Seite
components/      Nav, Hero, About, TechStack, Skills, Contact, Footer
components/three/  R3F-Partikelfeld (3D-Hintergrund)
public/images/  Fotos
```

## Anpassen

- **Fotos**: `public/images/`
- **Inhalte**: direkt in den jeweiligen Komponenten unter `components/`
- **Farben/Fonts**: `tailwind.config.ts` & `app/layout.tsx`
- **Social-Links**: `components/Contact.tsx` (aktuell Platzhalter `#`)