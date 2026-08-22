import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductShowcase from '@/components/ProductShowcase';
import ProductViewTracker from '@/components/ProductViewTracker';
import ValidationForm from '@/components/ValidationForm';
import Footer from '@/components/Footer';
import PageAnalytics from '@/components/PageAnalytics';

export default function LandingPage() {
  return (
    <>
      <PageAnalytics />
      <Header />
      <main>
        <Hero />
        <ProductViewTracker>
          <ProductShowcase />
        </ProductViewTracker>
        <ValidationForm />
      </main>
      <Footer />
    </>
  );
}
