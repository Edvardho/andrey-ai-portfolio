import type { RefObject } from 'react';
import { ArrowUp } from 'lucide-react';
import type { WorkspaceLayoutMode } from '@/lib/portfolio/workspace-layout';
import { portfolioFocusRing } from './portfolio-interaction-styles';

export function PortfolioComposer({
  input,
  onChangeInput,
  onSubmit,
  disabled,
  placeholder = 'Спросите про Андрея: опыт, проекты, процессы, продуктовые решения...',
  textareaRef,
  layoutMode = 'desktop',
}: {
  input: string;
  onChangeInput: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  placeholder?: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  layoutMode?: WorkspaceLayoutMode;
}) {
  const hasInput = input.trim().length > 0;
  const isSubmitDisabled = disabled || !hasInput;
  const compact = layoutMode === 'compact';

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
      className={[
        'relative flex w-full items-center overflow-hidden border border-[#D9DADF] bg-white shadow-[0px_6px_16px_rgba(0,0,0,0.05)]',
        compact
          ? 'min-h-14 rounded-[28px] py-1.5 pl-3 pr-1.5'
          : 'min-h-[62px] rounded-[32px] py-[10px] pl-7 pr-[10px]',
      ].join(' ')}
    >
      <div className={compact
        ? 'flex min-h-10 min-w-0 flex-1 items-center overflow-hidden pr-[50px]'
        : 'flex min-h-[42px] min-w-0 flex-1 items-center overflow-hidden pr-[54px]'}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => onChangeInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={placeholder}
          className={[
            'block w-full resize-none border-0 bg-transparent p-0 font-normal text-[#202129] outline-none placeholder:text-[#A2A5AE] disabled:cursor-not-allowed disabled:text-[#9EA3B1]',
            compact
              ? 'min-h-5 text-[14px] leading-5'
              : 'min-h-[24px] text-[17px] leading-6',
          ].join(' ')}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className={[
          'absolute flex shrink-0 items-center justify-center rounded-[999px] text-white transition-colors duration-150',
          compact ? 'bottom-1.5 right-1.5 size-11' : 'bottom-[9px] right-[9px] size-11',
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
