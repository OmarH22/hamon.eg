import Reveal from './Reveal';
import { HIGHLIGHTS } from '@/lib/copy';
import { bidiNumbers } from '@/lib/format';

/** Three short notes, separated by hairlines. No icons, no cards, no grid. */
export default function ProductHighlights() {
  return (
    <Reveal as="ul" className="mt-10 grid grid-cols-1 border-t border-line md:mt-14 sm:grid-cols-3">
      {HIGHLIGHTS.map((item) => (
        <li
          key={item}
          className="border-b border-line py-5 text-[15px] leading-[1.7] text-ink
                     sm:border-b-0 sm:border-s sm:py-7 sm:ps-6 sm:text-[15.5px]
                     sm:first:border-s-0 sm:first:ps-0 sm:last:border-b-0"
        >
          {bidiNumbers(item)}
        </li>
      ))}
    </Reveal>
  );
}
