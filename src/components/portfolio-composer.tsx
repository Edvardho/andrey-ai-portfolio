import type { RefObject } from 'react';

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
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.nativeEvent.isComposing || disabled) {
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
        disabled={disabled}
        className="absolute bottom-[10px] right-[10px] flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[999px] bg-[#000000] transition-colors duration-150 hover:bg-[#4D4D4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#000000]"
        aria-label="Отправить"
      >
        <span className="relative block size-[18.667px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/entry/icon-send.svg" alt="" className="absolute inset-0 block size-full max-w-none" />
        </span>
      </button>
    </form>
  );
}
