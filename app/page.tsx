import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import TechStack from "@/components/TechStack";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <About />
      <TechStack />
      <Skills />
      <Contact />
      <Footer />
    </main>
  );
}
