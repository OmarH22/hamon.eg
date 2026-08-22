import Reveal from './Reveal';
import ProductImage from './ProductImage';
import { HERO } from '@/lib/copy';
import { PRODUCT_IMAGES } from '@/lib/assets';
import { bidiNumbers } from '@/lib/format';
import { primaryButton } from './ui';

/**
 * On phones the eye goes headline → product → detail → CTA, so the image sits
 * between the two text blocks. On large screens the copy holds one column and
 * the product holds the other; explicit grid placement gives both without
 * duplicating any markup.
 */
export default function Hero() {
  return (
    <section id="top" className="pb-14 pt-8 md:pb-20 md:pt-14 lg:pb-28 lg:pt-16">
      <div
        className="shell grid grid-cols-1 gap-y-9 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-7
                   lg:grid-rows-[auto_auto]"
      >
        <Reveal
          as="h1"
          className="text-balance text-[30px] font-semibold leading-[1.45] tracking-normal
                     sm:text-[38px] sm:leading-[1.4] lg:col-span-5 lg:col-start-1 lg:row-start-1
                     lg:self-end lg:text-[46px] xl:text-[52px] xl:leading-[1.35]"
        >
          {bidiNumbers(HERO.headline)}
        </Reveal>

        <Reveal
          delay={90}
          className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-center"
        >
          <div className="relative aspect-square overflow-hidden rounded-card bg-panel shadow-lift lg:aspect-[5/4]">
            <ProductImage
              asset={PRODUCT_IMAGES.hero}
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          </div>
        </Reveal>

        <Reveal
          delay={60}
          className="lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-start"
        >
          <p className="max-w-prose text-[16px] leading-[1.95] text-muted sm:text-[17px]">
            {HERO.paragraph}
          </p>
          <p className="mt-4 max-w-prose text-[15px] leading-[1.95] text-muted sm:text-[16px]">
            {HERO.development}
          </p>
          <a
            href="#validation_form"
            data-analytics-id="hero_cta"
            className={`${primaryButton} mt-8 h-13 w-full sm:w-auto md:mt-9 md:h-14`}
          >
            {HERO.cta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
