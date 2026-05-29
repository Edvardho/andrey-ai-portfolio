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
  return (
    <form
      onSubmit={onSubmit}
      className="flex min-h-[62px] w-full items-center gap-4 overflow-hidden rounded-[32px] border border-[#D9DADF] bg-white py-3 pl-7 pr-[10px] shadow-[0px_6px_16px_rgba(0,0,0,0.05)]"
    >
      <div className="min-w-0 flex-1 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => onChangeInput(event.target.value)}
          rows={1}
          placeholder={placeholder}
          className="block max-h-[120px] min-h-[24px] w-full resize-none bg-transparent text-[17px] font-normal leading-6 text-[#202129] outline-none placeholder:text-[#A2A5AE]"
        />
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[999px] bg-[#000000] transition-colors duration-150 hover:bg-[#4D4D4D] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#000000]"
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
