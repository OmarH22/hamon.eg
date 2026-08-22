import { RESEARCH_INTRO } from '@/lib/copy';

export default function ResearchIntro() {
  return (
    <div className="max-w-[38ch]">
      <h2 className="text-[22px] font-semibold leading-[1.55] sm:text-[26px] lg:text-[30px]">
        {RESEARCH_INTRO.heading}
      </h2>
      <p className="mt-3 text-[15px] leading-[1.9] text-muted sm:text-[16px]">
        {RESEARCH_INTRO.body}
      </p>
    </div>
  );
}
