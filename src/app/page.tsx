import Features from "@/components/marketing/Features";
import Footer from "@/components/marketing/Footer";
import Hero from "@/components/marketing/Hero";
import LogoCloud from "@/components/marketing/LogoCloud";
import Navbar from "@/components/marketing/Navbar";

export default function LandingPage() {
  return (
    <main className="relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <LogoCloud />
      <Features />
      <Footer />
    </main>
  );
}
