'use client';

export function PortfolioAssistantLoadingRow() {
  return (
    <div
      className="flex w-full max-w-[798px] items-center gap-3 py-1"
      aria-live="polite"
      aria-label="Ассистент думает"
    >
      <div className="flex size-7 shrink-0 items-center justify-center rounded-[14px] bg-[#F2F4FF]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ui/assistant-mark.svg"
          alt=""
          aria-hidden="true"
          className="size-[14px]"
        />
      </div>

      <div className="min-w-0 pt-px">
        <span
          className="loading-thinking-word block text-[15px] font-semibold leading-[22px] tracking-[-0.01em] text-transparent"
        >
          Думаю
        </span>
      </div>

      <style jsx>{`
        .loading-thinking-word {
          background-image: linear-gradient(
            110deg,
            #24272e 0%,
            #24272e 35%,
            #9da3c7 50%,
            #24272e 65%,
            #24272e 100%
          );
          background-size: 200% 100%;
          background-position: 130% 50%;
          background-clip: text;
          -webkit-background-clip: text;
          animation: thinking-sheen 1.2s linear infinite;
          will-change: background-position;
        }

        @keyframes thinking-sheen {
          0% {
            background-position: 130% 50%;
          }

          100% {
            background-position: -120% 50%;
          }
        }
      `}</style>
    </div>
  );
}
