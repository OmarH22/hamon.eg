import Reveal from './Reveal';
import ProductImage from './ProductImage';
import ProductHighlights from './ProductHighlights';
import PrototypeDisclaimer from './PrototypeDisclaimer';
import { PRODUCT_IMAGES } from '@/lib/assets';

/** The two concepts, the three product notes and the prototype disclaimer. */
export default function ProductShowcase() {
  return (
    <section id="product_section" data-analytics-id="product_section" className="scroll-mt-24 pb-16 md:pb-24">
      <div className="shell">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
          <Reveal>
            <figure
              data-analytics-id="product_white"
              className="relative aspect-square overflow-hidden rounded-card bg-panel"
            >
              <ProductImage
                asset={PRODUCT_IMAGES.white}
                sizes="(min-width: 640px) 46vw, 100vw"
              />
            </figure>
          </Reveal>
          <Reveal delay={90}>
            <figure
              data-analytics-id="product_black"
              className="relative aspect-square overflow-hidden rounded-card bg-panel"
            >
              <ProductImage
                asset={PRODUCT_IMAGES.black}
                sizes="(min-width: 640px) 46vw, 100vw"
              />
            </figure>
          </Reveal>
        </div>

        <ProductHighlights />
        <PrototypeDisclaimer />
      </div>
    </section>
  );
}
