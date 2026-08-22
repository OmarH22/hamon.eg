/**
 * LOCKED CUSTOMER-FACING COPY — single source of truth.
 *
 * Every Arabic string a visitor can see lives in this file and nowhere else.
 * These strings are FINAL. Do not rewrite, paraphrase, shorten, expand,
 * translate, or "improve" them. Components must render them verbatim.
 *
 * Strings that still need approved copy are grouped under `PLACEHOLDER_COPY`
 * at the bottom of this file and are visibly marked in the UI.
 */

export const HERO = {
  headline: 'سنيكرز بيديك 6 سم زيادة في طولك.',
  paragraph: 'الزيادة مدمجة جوه تصميم الجزمة، مع الحفاظ على شكل السنيكرز الطبيعي.',
  development: 'HAMON لسه في مرحلة تطوير المنتج، ورأيك هيساعدنا ناخد قرارنا قبل ما نبدأ الإنتاج.',
  cta: 'قولنا رأيك',
} as const;

/** Header CTA uses the same locked string as the hero CTA. */
export const HEADER_CTA = HERO.cta;

export const HIGHLIGHTS = [
  '+6 سم زيادة في الطول',
  'مدمجة جوه التصميم',
  'شكل سنيكرز طبيعي',
] as const;

export const PROTOTYPE_DISCLAIMER =
  'الصور والتصميم المعروضين مبدئيين لتوضيح فكرة المنتج، والنسخة النهائية ممكن تختلف.';

export const RESEARCH_INTRO = {
  heading: 'رأيك هيفرق معانا قبل ما ناخد قرار الإنتاج.',
  body: 'جاوب على كام سؤال بسيط، مش هياخدوا منك أكتر من دقيقة.',
} as const;

export const FORM_COPY = {
  submit: 'ابعت رأيك',
  submitting: 'جاري الإرسال...',
  requiredError: 'اختار إجابة الأول.',
  submitError: 'حصلت مشكلة بسيطة. جرّب تاني بعد شوية.',
} as const;

export const SUCCESS = {
  heading: 'شكرًا على رأيك.',
  body: 'إجابتك هتساعدنا ناخد قرارات أحسن قبل ما نبدأ إنتاج HAMON.',
  cta: 'شوف المنتج تاني',
} as const;

export const META = {
  title: 'HAMON — سنيكرز بزيادة 6 سم',
  description:
    'HAMON بتطوّر سنيكرز بزيادة 6 سم مدمجة جوه التصميم. شوف الفكرة وقولنا رأيك.',
} as const;

export const FOOTER = {
  copyright: '© HAMON',
} as const;

/**
 * NOT APPROVED YET — development placeholders.
 *
 * These strings were never supplied, so nothing here is final copy. They render
 * with a visible [—] marker so they can never be mistaken for approved text.
 * Replace the values below with approved Arabic copy, then delete the marker in
 * `mark()`.
 */
const PLACEHOLDER_MARK = '[—] ';
const mark = (s: string) => `${PLACEHOLDER_MARK}${s}`;

export const PLACEHOLDER_COPY = {
  /** Footer link label pointing at /privacy. */
  privacyLink: mark('الخصوصية'),
  /** /privacy page — heading + body paragraphs. */
  privacyPageTitle: mark('الخصوصية'),
  privacyPageBody: [
    mark('إجابات الاستبيان بتتجمع لأغراض بحث المنتج.'),
    mark('HAMON مش بتطلب اسم أو إيميل أو رقم تليفون في التجربة دي.'),
    mark('ممكن يتجمع معلومات تقنية مجهولة الهوية.'),
    mark('ممكن نستخدم أدوات تحليلات إعلانية زي Meta Pixel.'),
  ],
} as const;

/**
 * Image alt text. Factual, minimal, built only from the brand name and the
 * approved colour words. Adjust if you prefer different wording.
 */
export const ALT = {
  logo: 'HAMON',
  white: 'HAMON — الأبيض',
  black: 'HAMON — الأسود',
} as const;
