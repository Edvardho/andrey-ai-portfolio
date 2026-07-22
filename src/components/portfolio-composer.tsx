import type { RefObject } from 'react';
import { ArrowUp } from 'lucide-react';
import { portfolioFocusRing } from './portfolio-interaction-styles';

export function PortfolioComposer({
  input,
  onChangeInput,
  onSubmit,
  disabled,
  placeholder = 'Спросите про Андрея: опыт, проекты, процессы, продуктовые решения...',
  textareaRef,
}: {
  input: string;
  onChangeInput: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  placeholder?: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const hasInput = input.trim().length > 0;
  const isSubmitDisabled = disabled || !hasInput;

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.nativeEvent.isComposing || isSubmitDisabled) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative flex min-h-[62px] w-full items-center overflow-hidden rounded-[32px] border border-[#D9DADF] bg-white py-[10px] pl-7 pr-[10px] shadow-[0px_6px_16px_rgba(0,0,0,0.05)]"
    >
      <div className="flex min-h-[42px] min-w-0 flex-1 items-center overflow-hidden pr-[54px]">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => onChangeInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={placeholder}
          className="block min-h-[24px] w-full resize-none border-0 bg-transparent p-0 text-[17px] font-normal leading-6 text-[#202129] outline-none placeholder:text-[#A2A5AE] disabled:cursor-not-allowed disabled:text-[#9EA3B1]"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className={[
          'absolute bottom-[10px] right-[10px] flex size-[42px] shrink-0 items-center justify-center rounded-[999px] text-white transition-colors duration-150',
          portfolioFocusRing,
          isSubmitDisabled
            ? 'cursor-not-allowed bg-[#A6A6A6]'
            : 'cursor-pointer bg-[#1A1C22] hover:bg-[#242832]',
        ].join(' ')}
        aria-label="Отправить"
      >
        <span className="flex size-[20px] items-center justify-center">
          <ArrowUp className="size-[20px] text-white" strokeWidth={2.2} />
        </span>
      </button>
    </form>
  );
}
