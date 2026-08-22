import ProductImage from './ProductImage';
import { optionInputId } from './OptionGroup';
import type { ChoiceQuestion } from '@/lib/survey';

/**
 * Image-led choice: the two concepts as large cards, the remaining answers as
 * chips underneath. All four are the same native radio group.
 */
export default function ColorSelector({
  question,
  value,
  onSelect,
}: {
  question: ChoiceQuestion;
  value: string;
  onSelect: (value: string) => void;
}) {
  const imageValues = question.imageValues ?? [];
  const cards = question.options.filter((o) => imageValues.includes(o.value) && o.image);
  const rest = question.options.filter((o) => !cards.includes(o));

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {cards.map((option) => (
          <label key={option.value} className="block">
            <input
              type="radio"
              className="option-input"
              id={optionInputId(question.id, option.value)}
              name={question.id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onSelect(option.value)}
            />
            <span className="color-face">
              <span className="relative block aspect-square bg-panel">
                <ProductImage
                  asset={option.image!}
                  decorative
                  sizes="(min-width: 640px) 22vw, 45vw"
                />
              </span>
              <span className="flex items-center gap-2.5 px-3 py-3 text-[14px] sm:px-4 sm:text-[15px]">
                <span className="option-dot" aria-hidden="true" />
                <span>{option.label}</span>
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2.5 sm:mt-4">
        {rest.map((option) => (
          <label key={option.value} className="block">
            <input
              type="radio"
              className="option-input"
              id={optionInputId(question.id, option.value)}
              name={question.id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onSelect(option.value)}
            />
            <span className="chip-face">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
