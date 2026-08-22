/**
 * Locked-copy guard.  Run with: npm run verify:copy
 *
 * 1. Every approved Arabic string must appear character-for-character in the
 *    source, so a refactor cannot quietly reword the page.
 * 2. No Arabic literal may live anywhere except the two copy files, so all
 *    customer-facing text stays in one reviewable place.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const COPY_FILES = ['src/lib/copy.ts', 'src/lib/survey.ts'];
const ARABIC = /[\u0600-\u06FF\u0750-\u077F]/;

const LOCKED = {
  'hero headline': 'سنيكرز بيديك 6 سم زيادة في طولك.',
  'hero paragraph': 'الزيادة مدمجة جوه تصميم الجزمة، مع الحفاظ على شكل السنيكرز الطبيعي.',
  'hero development': 'HAMON لسه في مرحلة تطوير المنتج، ورأيك هيساعدنا ناخد قرارنا قبل ما نبدأ الإنتاج.',
  'primary cta': 'قولنا رأيك',
  'highlight 1': '+6 سم زيادة في الطول',
  'highlight 2': 'مدمجة جوه التصميم',
  'highlight 3': 'شكل سنيكرز طبيعي',
  disclaimer: 'الصور والتصميم المعروضين مبدئيين لتوضيح فكرة المنتج، والنسخة النهائية ممكن تختلف.',
  'research heading': 'رأيك هيفرق معانا قبل ما ناخد قرار الإنتاج.',
  'research body': 'جاوب على كام سؤال بسيط، مش هياخدوا منك أكتر من دقيقة.',
  'q1 legend': 'بعد ما شوفت الفكرة، قد إيه ممكن تفكر تشتري سنيكرز زي دي؟',
  'q1 a': 'أكيد ممكن أشتريها',
  'q1 b': 'غالبًا ممكن أشتريها',
  'q1 c': 'ممكن، حسب المنتج النهائي',
  'q1 d': 'غالبًا مش هشتريها',
  'q1 e': 'مش مهتم أشتريها',
  'q2 legend': 'مقاسك كام في السنيكرز عادة؟',
  'q2 under': 'أقل من 38',
  'q2 over': 'أكبر من 44',
  'q3 legend': 'لو HAMON نزلت باللونين دول، أنهي لون أقرب لاختيارك؟',
  'q3 a': 'الأبيض',
  'q3 b': 'الأسود',
  'q3 c': 'الاتنين',
  'q3 d': 'ولا واحد فيهم',
  'q4 legend': 'لو هتشتري سنيكرز زي دي، إيه أهم حاجة بالنسبة لك؟',
  'q4 a': 'الراحة',
  'q4 b': 'شكل وتصميم الجزمة',
  'q4 c': 'إن زيادة الطول شكلها يبقى طبيعي',
  'q4 d': 'الجودة والخامات',
  'q4 e': 'السعر',
  'q4 f': 'خفة ووزن الجزمة',
  'q5 legend': 'إيه أكتر حاجة ممكن تخليك تتردد قبل ما تشتريها؟',
  'q5 a': 'إني أخاف تكون مش مريحة',
  'q5 b': 'شكلها وهي متلبسة',
  'q5 c': 'إن زيادة الطول تبان بشكل مش طبيعي',
  'q5 e': 'لو سعرها طلع عالي',
  'q5 f': 'إني أحب أجربها الأول قبل ما أشتري',
  'q5 g': 'إني مش متأكد إن الفكرة مهمة بالنسبالي',
  'q5 h': 'سبب تاني',
  'q5 other label': 'قولنا إيه السبب',
  'q6 legend': 'لو في حاجة واحدة لازم نعملها صح عشان تفكر تشتري HAMON، هتكون إيه؟',
  'q6 placeholder': 'اكتب رأيك براحتك...',
  submit: 'ابعت رأيك',
  submitting: 'جاري الإرسال...',
  'required error': 'اختار إجابة الأول.',
  'submit error': 'حصلت مشكلة بسيطة. جرّب تاني بعد شوية.',
  'success heading': 'شكرًا على رأيك.',
  'success body': 'إجابتك هتساعدنا ناخد قرارات أحسن قبل ما نبدأ إنتاج HAMON.',
  'success cta': 'شوف المنتج تاني',
  'meta title': 'HAMON — سنيكرز بزيادة 6 سم',
  'meta description': 'HAMON بتطوّر سنيكرز بزيادة 6 سم مدمجة جوه التصميم. شوف الفكرة وقولنا رأيك.',
};

const haystack = COPY_FILES.map((file) => readFileSync(join(ROOT, file), 'utf8')).join('\n');

let failures = 0;
for (const [name, value] of Object.entries(LOCKED)) {
  if (!haystack.includes(value)) {
    console.error(`MISSING OR ALTERED  ${name}: ${value}`);
    failures += 1;
  }
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(entry)) files.push(full);
  }
  return files;
}

for (const file of walk(join(ROOT, 'src'))) {
  const rel = relative(ROOT, file).split(sep).join('/');
  if (COPY_FILES.includes(rel)) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (ARABIC.test(line)) {
      console.error(`ARABIC LITERAL OUTSIDE COPY FILES  ${rel}:${index + 1}  ${line.trim()}`);
      failures += 1;
    }
  });
}

if (failures > 0) {
  console.error(`\n${failures} problem(s) found.`);
  process.exit(1);
}
console.log(
  `OK — ${Object.keys(LOCKED).length} locked strings verified, no Arabic literals outside ${COPY_FILES.join(' and ')}.`,
);
