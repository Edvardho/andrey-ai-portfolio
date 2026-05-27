import type { ModalPayload, ContactOption } from '@/lib/portfolio/types';
import { PortfolioPreviewSurface } from './portfolio-preview-surface';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function ContactOptionRow({ option }: { option: ContactOption }) {
  return (
    <a
      href={option.href}
      target={option.id === 'email' ? undefined : '_blank'}
      rel={option.id === 'email' ? undefined : 'noreferrer'}
      className="flex items-start justify-between rounded-[24px] border border-[#e6ded3] bg-[#fffdfa] px-5 py-4 transition hover:border-[#d6cab8] hover:bg-white"
    >
      <div>
        <div className="text-[16px] font-semibold text-[#11110f]">{option.label}</div>
        <div className="mt-1 text-[15px] leading-7 text-[#6e665d]">{option.helper}</div>
      </div>
      <div className="text-[#8b8174]">↗</div>
    </a>
  );
}

export function PortfolioModalOverlay({
  modal,
  onClose,
}: {
  modal: ModalPayload;
  onClose: () => void;
}) {
  const isContact = modal.type === 'contact';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,15,11,0.68)] px-6 py-10">
      <button type="button" aria-label="Закрыть" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div
        className={cx(
          'relative z-10 w-full rounded-[36px] bg-white shadow-[0_28px_80px_rgba(17,15,11,0.22)]',
          isContact ? 'max-w-[620px] p-7' : 'max-w-[1320px] p-7',
        )}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-[34px] font-semibold tracking-[-0.03em] text-[#11110f]">{modal.title}</div>
            {'helper' in modal ? <div className="mt-2 text-[15px] leading-7 text-[#6e665d]">{modal.helper}</div> : null}
            {'caption' in modal ? <div className="mt-2 text-[15px] leading-7 text-[#6e665d]">{modal.caption}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e5ddd1] bg-white text-[22px] text-[#6c6358] transition hover:border-[#d4c6b3] hover:bg-[#fbf8f2]"
          >
            ×
          </button>
        </div>

        {isContact ? (
          <div className="mt-7 space-y-3">
            {modal.options.map((option: ContactOption) => (
              <ContactOptionRow key={option.id} option={option} />
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-[30px] border border-[#e8e1d7] bg-[#faf7f1] p-5">
            <PortfolioPreviewSurface
              src={modal.imageUrl}
              title={modal.title}
              subtitle={modal.note ?? modal.caption}
              badge={modal.sourceLabel ?? 'Artifact'}
              className="min-h-[72vh] w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
