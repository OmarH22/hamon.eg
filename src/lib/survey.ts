import { PRODUCT_IMAGES, type ImageAsset } from './assets';

/**
 * SURVEY CONFIGURATION — the single definition of the questionnaire.
 *
 * The form UI, client-side validation, server-side payload validation, the CSV
 * export and the admin dashboard are all derived from this array. Adding,
 * removing or re-ordering a question here updates every one of them.
 *
 * Question and option wording is LOCKED customer-facing copy.
 * `value` strings are internal database values and are never shown to visitors.
 */

export interface SurveyOption {
  /** Internal database value. Never rendered. */
  value: string;
  /** LOCKED Arabic label shown to the visitor. */
  label: string;
  /** Optional artwork for image-led layouts. */
  image?: ImageAsset;
}

export interface FollowUpField {
  /** Database column the free text is stored in. */
  column: string;
  /** Only shown when the parent question holds this value. */
  whenValue: string;
  /** LOCKED label + placeholder. */
  label: string;
  maxLength: number;
}

interface BaseQuestion {
  /** Database column, also used as the form field name. */
  id: string;
  /** Stable analytics hook, exposed as data-analytics-id. */
  analyticsId: string;
  /** LOCKED question text. */
  legend: string;
  enabled: boolean;
}

export interface ChoiceQuestion extends BaseQuestion {
  kind: 'single';
  required: true;
  /** Visual treatment: stacked radio cards, compact chips, or image cards. */
  layout: 'list' | 'chips' | 'color';
  options: SurveyOption[];
  /** Values rendered as large image cards; the rest fall back to chips. */
  imageValues?: string[];
  followUp?: FollowUpField;
  /** Reading order for the admin dashboard when it differs from the form. */
  reportOrder?: string[];
}

export interface TextQuestion extends BaseQuestion {
  kind: 'text';
  required: false;
  control: 'textarea';
  /** LOCKED placeholder. */
  placeholder: string;
  maxLength: number;
}

export type SurveyQuestion = ChoiceQuestion | TextQuestion;

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'interest_level',
    analyticsId: 'question_purchase_intent',
    legend: 'بعد ما شوفت الفكرة، قد إيه ممكن تفكر تشتري سنيكرز زي دي؟',
    kind: 'single',
    required: true,
    layout: 'list',
    enabled: true,
    options: [
      { value: 'very_high', label: 'أكيد ممكن أشتريها' },
      { value: 'high', label: 'غالبًا ممكن أشتريها' },
      { value: 'conditional', label: 'ممكن، حسب المنتج النهائي' },
      { value: 'low', label: 'غالبًا مش هشتريها' },
      { value: 'none', label: 'مش مهتم أشتريها' },
    ],
  },
  {
    id: 'shoe_size',
    analyticsId: 'question_size',
    legend: 'مقاسك كام في السنيكرز عادة؟',
    kind: 'single',
    required: true,
    layout: 'chips',
    enabled: true,
    options: [
      { value: '38', label: '38' },
      { value: '39', label: '39' },
      { value: '40', label: '40' },
      { value: '41', label: '41' },
      { value: '42', label: '42' },
      { value: '43', label: '43' },
      { value: '44', label: '44' },
      { value: 'under_38', label: 'أقل من 38' },
      { value: 'over_44', label: 'أكبر من 44' },
    ],
    reportOrder: ['under_38', '38', '39', '40', '41', '42', '43', '44', 'over_44'],
  },
  {
    id: 'preferred_color',
    analyticsId: 'question_color',
    legend: 'لو HAMON نزلت باللونين دول، أنهي لون أقرب لاختيارك؟',
    kind: 'single',
    required: true,
    layout: 'color',
    enabled: true,
    imageValues: ['white', 'black'],
    options: [
      { value: 'white', label: 'الأبيض', image: PRODUCT_IMAGES.white },
      { value: 'black', label: 'الأسود', image: PRODUCT_IMAGES.black },
      { value: 'both', label: 'الاتنين' },
      { value: 'none', label: 'ولا واحد فيهم' },
    ],
  },
  {
    id: 'most_important_factor',
    analyticsId: 'question_priority',
    legend: 'لو هتشتري سنيكرز زي دي، إيه أهم حاجة بالنسبة لك؟',
    kind: 'single',
    required: true,
    layout: 'list',
    enabled: true,
    options: [
      { value: 'comfort', label: 'الراحة' },
      { value: 'design', label: 'شكل وتصميم الجزمة' },
      { value: 'natural_look', label: 'إن زيادة الطول شكلها يبقى طبيعي' },
      { value: 'quality', label: 'الجودة والخامات' },
      { value: 'price', label: 'السعر' },
      { value: 'weight', label: 'خفة ووزن الجزمة' },
    ],
  },
  {
    id: 'main_concern',
    analyticsId: 'question_barrier',
    legend: 'إيه أكتر حاجة ممكن تخليك تتردد قبل ما تشتريها؟',
    kind: 'single',
    required: true,
    layout: 'list',
    enabled: true,
    options: [
      { value: 'comfort_doubt', label: 'إني أخاف تكون مش مريحة' },
      { value: 'look_when_worn', label: 'شكلها وهي متلبسة' },
      { value: 'unnatural_lift', label: 'إن زيادة الطول تبان بشكل مش طبيعي' },
      { value: 'quality_doubt', label: 'الجودة والخامات' },
      { value: 'price_high', label: 'لو سعرها طلع عالي' },
      { value: 'try_first', label: 'إني أحب أجربها الأول قبل ما أشتري' },
      { value: 'relevance_doubt', label: 'إني مش متأكد إن الفكرة مهمة بالنسبالي' },
      { value: 'other', label: 'سبب تاني' },
    ],
    followUp: {
      column: 'main_concern_other',
      whenValue: 'other',
      label: 'قولنا إيه السبب',
      maxLength: 160,
    },
  },
  {
    id: 'open_feedback',
    analyticsId: 'question_feedback',
    legend: 'لو في حاجة واحدة لازم نعملها صح عشان تفكر تشتري HAMON، هتكون إيه؟',
    kind: 'text',
    control: 'textarea',
    required: false,
    enabled: true,
    placeholder: 'اكتب رأيك براحتك...',
    maxLength: 400,
  },

  // ---------------------------------------------------------------------------
  // FUTURE — pricing question. Deliberately NOT part of this version: the
  // production cost is unknown and we will not test an arbitrary price.
  // The nullable `price_expectation` column already exists in the schema, so
  // uncommenting this block (with approved Arabic copy) is the only change
  // needed to ship it.
  //
  // {
  //   id: 'price_expectation',
  //   analyticsId: 'question_price',
  //   legend: 'TODO — awaiting approved Arabic copy',
  //   kind: 'single',
  //   required: true,
  //   layout: 'list',
  //   enabled: true,
  //   options: [
  //     { value: 'band_1', label: 'TODO — awaiting approved Arabic copy' },
  //     { value: 'band_2', label: 'TODO — awaiting approved Arabic copy' },
  //   ],
  // },
  // ---------------------------------------------------------------------------
];

/** Questions actually rendered and validated. */
export const ACTIVE_QUESTIONS = SURVEY_QUESTIONS.filter((q) => q.enabled);

export const isChoiceQuestion = (q: SurveyQuestion): q is ChoiceQuestion => q.kind === 'single';
export const isTextQuestion = (q: SurveyQuestion): q is TextQuestion => q.kind === 'text';

/** Every database column the questionnaire can write to. */
export const ANSWER_COLUMNS: string[] = ACTIVE_QUESTIONS.flatMap((q) =>
  isChoiceQuestion(q) && q.followUp ? [q.id, q.followUp.column] : [q.id],
);

export const getQuestion = (id: string) => ACTIVE_QUESTIONS.find((q) => q.id === id);

export const optionLabel = (questionId: string, value: string | null): string => {
  if (!value) return '';
  const q = getQuestion(questionId);
  if (!q || !isChoiceQuestion(q)) return value;
  return q.options.find((o) => o.value === value)?.label ?? value;
};

/** Option values in the order the admin dashboard should display them. */
export const reportValues = (q: ChoiceQuestion): string[] =>
  q.reportOrder ?? q.options.map((o) => o.value);
