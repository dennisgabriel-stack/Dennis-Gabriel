import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ArchitectureSection from "@/components/ArchitectureSection";
import About from "@/components/About";
import TransactionSection from "@/components/TransactionSection";
import TechStack from "@/components/TechStack";
import TechCubesSection from "@/components/TechCubesSection";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <ArchitectureSection />
      <About />
      <TransactionSection />
      <TechStack />
      <TechCubesSection />
      <Skills />
      <Contact />
      <Footer />
    </main>
  );
}
