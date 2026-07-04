import Blogs from "@/components/landing/Blogs";
import Hero from "@/components/landing/Hero";
import ProductLaunches from "@/components/landing/ProductLaunches";


export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] selection:bg-[var(--color-brand-primary)]/30">
      <Hero />
      <ProductLaunches />
      <Blogs />
    </main>
  );
}