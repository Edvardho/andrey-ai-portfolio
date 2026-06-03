function MessageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 17L4 20V7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V15C20 16.1046 19.1046 17 18 17H7Z"
        stroke="#262B36"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 10H15" stroke="#262B36" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 13H13" stroke="#262B36" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LimitReachedIcon() {
  return (
    <div className="relative size-6" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 17L4 20V7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V15C20 16.1046 19.1046 17 18 17H7Z"
          stroke="#262B36"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 10H15" stroke="#262B36" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 13H13" stroke="#262B36" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-[#FF7C6E]">
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path d="M2 7L7 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}

export function PortfolioSessionLimitCard({
  messagesRemaining,
  onContactClick,
}: {
  messagesRemaining: number;
  onContactClick: () => void;
}) {
  const hasMessages = messagesRemaining > 0;

  return (
    <div className="box-border flex w-[280px] min-w-[280px] max-w-[280px] items-center gap-3 overflow-hidden rounded-[18px] border border-[#EBEDF2] bg-white p-4 shadow-[0px_6px_10px_rgba(0,0,0,0.04)]">
      <div
        className={`flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[12px] p-1 ${
          hasMessages ? 'bg-[#F1F2FF]' : 'bg-[#FFF1F1]'
        }`}
      >
        <div className="size-6 shrink-0">
          {hasMessages ? <MessageIcon /> : <LimitReachedIcon />}
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_0_0] flex-col items-start gap-1 overflow-hidden">
        <div className="w-full text-[15px] font-semibold leading-[1.2] text-[#202129]">
          {hasMessages ? `Осталось сообщений: ${messagesRemaining}` : 'Сообщения закончились'}
        </div>
        <div className="w-full text-[13px] font-normal leading-[1.35] text-[#5E606A]">
          {hasMessages
            ? 'При достижении лимита продолжите диалог с Андреем'
            : 'Вы можете продолжить диалог с Андреем'}
        </div>
        {!hasMessages ? (
          <button
            type="button"
            onClick={onContactClick}
            className="mt-2 h-8 cursor-pointer rounded-full bg-[#1A1C22] px-3 text-[13px] font-medium leading-5 text-white transition hover:bg-[#4D4D4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8EA2FF] focus-visible:ring-offset-2"
          >
            Написать Андрею
          </button>
        ) : null}
      </div>
    </div>
  );
}
