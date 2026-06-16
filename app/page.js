import Blogs from "@/components/landing/Blogs";
import Hero from "@/components/landing/Hero";


export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] selection:bg-[var(--color-brand-primary)]/30">
      <Hero />
      <Blogs />
    </main>
  );
}