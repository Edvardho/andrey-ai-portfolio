import type { RefObject } from 'react';

export function PortfolioComposer({
  input,
  onChangeInput,
  onSubmit,
  disabled,
  placeholder = 'Спросите про Андрея: опыт, проекты, процессы, продуктовые решения...',
  title = 'Задать вопрос',
  textareaRef,
}: {
  input: string;
  onChangeInput: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  placeholder?: string;
  title?: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[34px] border border-[#e8e1d7] bg-white p-4 shadow-[0_16px_36px_rgba(31,26,20,0.05)]"
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#a3998d] px-2">{title}</div>
      <div className="mt-3 flex items-end gap-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => onChangeInput(event.target.value)}
          rows={1}
          placeholder={placeholder}
          className="max-h-[128px] min-h-[64px] flex-1 resize-none rounded-[24px] border border-[#e7e0d5] bg-[#fffdfa] px-5 py-4 text-[16px] leading-8 text-[#1d1b17] outline-none transition placeholder:text-[#9a9185] focus:border-[#d4c6b3]"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-full bg-[#13110f] px-7 py-4 text-[16px] font-medium text-white transition hover:bg-[#22201c] disabled:cursor-not-allowed disabled:bg-[#c9c0b5]"
        >
          Отправить
        </button>
      </div>
    </form>
  );
}
