import type { RefObject } from 'react';
import { PortfolioButton } from './portfolio-button';

export function PortfolioComposer({
  input,
  onChangeInput,
  onSubmit,
  disabled,
  placeholder = 'Спросите про Андрея: опыт, проекты, процессы, продуктовые решения...',
  title = 'Задать вопрос',
  textareaRef,
  variant = 'chat',
}: {
  input: string;
  onChangeInput: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
  placeholder?: string;
  title?: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  variant?: 'landing' | 'chat';
}) {
  const isLanding = variant === 'landing';

  return (
    <form
      onSubmit={onSubmit}
      className={
        isLanding
          ? 'h-[70px] w-full rounded-[999px] border border-[#d9dadf] bg-white px-[10px] py-[8px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.05)]'
          : 'rounded-[34px] border border-[#EBEDF2] bg-white p-4 shadow-[0_16px_36px_rgba(31,26,20,0.05)]'
      }
    >
      {!isLanding ? (
        <div className="px-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[#a3998d]">{title}</div>
      ) : null}
      <div className={isLanding ? 'flex h-full items-center gap-[10px]' : 'mt-3 flex items-end gap-4'}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => onChangeInput(event.target.value)}
          rows={1}
          placeholder={placeholder}
          className={
            isLanding
              ? 'h-full max-h-[54px] min-h-0 flex-1 resize-none bg-transparent px-[12px] py-[15px] text-[19px] leading-[24px] text-[#20232c] outline-none placeholder:text-[#a2a5ae]'
              : 'max-h-[128px] min-h-[64px] flex-1 resize-none rounded-[24px] border border-[#e7e0d5] bg-[#fffdfa] px-5 py-4 text-[16px] leading-8 text-[#1d1b17] outline-none transition placeholder:text-[#9a9185] focus:border-[#d4c6b3]'
          }
        />
        {isLanding ? (
          <PortfolioButton
            type="submit"
            disabled={disabled}
            size="icon-lg"
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/entry/icon-send.svg" alt="" className="size-6" />
            }
          />
        ) : (
          <PortfolioButton type="submit" disabled={disabled} size="lg">
            Отправить
          </PortfolioButton>
        )}
      </div>
    </form>
  );
}
