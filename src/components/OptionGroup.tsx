import type { ChoiceQuestion } from '@/lib/survey';

export const optionInputId = (questionId: string, value: string) => `opt_${questionId}_${value}`;

interface GroupProps {
  question: ChoiceQuestion;
  value: string;
  onSelect: (value: string) => void;
}

/** Stacked radio cards — the default treatment for wordy options. */
export function OptionList({ question, value, onSelect }: GroupProps) {
  return (
    <div className="space-y-2.5">
      {question.options.map((option) => (
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
          <span className="option-face">
            <span className="option-dot" aria-hidden="true" />
            <span>{option.label}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

/** Compact chips — for short options such as shoe sizes. */
export function ChipGroup({ question, value, onSelect }: GroupProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {question.options.map((option) => (
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
          <span className="chip-face min-w-[68px]">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
