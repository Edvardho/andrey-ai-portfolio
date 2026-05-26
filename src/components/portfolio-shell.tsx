'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { getCaseById } from '@/data/portfolio-content';
import type {
  AssistantEnvelope,
  Artifact,
  ChatRequestBody,
  ContactOption,
  GalleryItem,
  PromptChip,
  UIAction,
} from '@/lib/portfolio/types';

type ThreadItem =
  | { kind: 'user'; text: string }
  | { kind: 'assistant'; envelope: AssistantEnvelope };

function isModalView(envelope: AssistantEnvelope) {
  return envelope.uiState === 'modal' || envelope.viewType === 'contact_modal' || envelope.viewType === 'image_modal';
}

function renderActionLabel(label: string) {
  return label.trim();
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function getArtifact(caseId: string, artifactId: string): Artifact | undefined {
  return getCaseById(caseId)?.artifacts.find((artifact) => artifact.id === artifactId);
}

function getCasePreview(caseId: string | null) {
  if (!caseId) {
    return null;
  }

  const caseContent = getCaseById(caseId);
  if (!caseContent) {
    return null;
  }

  const heroArtifact = caseContent.artifacts[0];

  return {
    title: caseContent.title,
    subtitle: caseContent.shortDescription,
    imageUrl: heroArtifact?.imageUrl,
    badge: caseContent.tags[0] ?? caseContent.category,
  };
}

function PreviewSurface({
  src,
  title,
  subtitle,
  badge,
  className,
}: {
  src?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (src && !broken) {
    return (
      <div className={cx('overflow-hidden rounded-[24px] border border-[#e8e2d9] bg-[#f6f3ee]', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title}
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cx(
        'overflow-hidden rounded-[24px] border border-[#e8e2d9] bg-[linear-gradient(160deg,#faf8f4_0%,#f0ece6_100%)]',
        className,
      )}
    >
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-[#ddd6cb] bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b6257]">
            {badge ?? 'Preview'}
          </span>
          <div className="h-10 w-10 rounded-2xl border border-white/60 bg-white/60" />
        </div>
        <div>
          <div className="text-base font-semibold text-[#191714]">{title}</div>
          {subtitle ? <div className="mt-2 text-sm leading-6 text-[#6e675d]">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[760px] rounded-[28px] border border-[#ebe4da] bg-white px-7 py-5 text-[16px] leading-7 text-[#22201c] shadow-[0_10px_30px_rgba(36,30,24,0.05)]">
        {text}
      </div>
    </div>
  );
}

function PromptChipButton({
  chip,
  onClick,
  emphasis = false,
}: {
  chip: PromptChip;
  onClick: (chip: PromptChip) => void;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(chip)}
      className={cx(
        'rounded-full border px-5 py-3 text-[15px] leading-6 transition',
        emphasis
          ? 'border-[#d9d1c6] bg-white text-[#1b1915] shadow-[0_6px_20px_rgba(35,28,20,0.04)] hover:border-[#c9beaf] hover:bg-[#fffcf7]'
          : 'border-[#e5ddd1] bg-[#fffcf7] text-[#5e574f] hover:border-[#d2c7b7] hover:bg-white',
      )}
    >
      {chip.label}
    </button>
  );
}

function RailPreview({
  title,
  subtitle,
  selected,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
}) {
  return (
    <div
      className={cx(
        'relative flex items-center gap-4 rounded-[26px] border px-4 py-4 text-left transition',
        selected
          ? 'border-[#d8d0c4] bg-white shadow-[0_10px_24px_rgba(31,26,20,0.05)]'
          : 'border-[#ece6dc] bg-white/90 hover:border-[#ddd5ca] hover:bg-white',
      )}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[#ebe5da] bg-[linear-gradient(160deg,#faf8f3_0%,#f0ebe3_100%)] text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6a6258]">
        {title.slice(0, 2)}
      </div>
      <div className="min-w-0">
        <div className="text-[16px] font-semibold text-[#1d1b17]">{title}</div>
        <div className="mt-1 text-[14px] text-[#7b7368]">{subtitle}</div>
      </div>
      {selected ? <div className="ml-auto h-2.5 w-2.5 rounded-full bg-[#5b61ff]" /> : null}
    </div>
  );
}

function Gallery({
  items,
  caseId,
  onOpenArtifact,
}: {
  items: GalleryItem[];
  caseId: string | null;
  onOpenArtifact: (artifactId: string, title: string) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
      {items.map((item) => {
        const artifact = caseId ? getArtifact(caseId, item.artifactId) : undefined;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpenArtifact(item.artifactId, item.title)}
            className="rounded-[28px] border border-[#e8e2d8] bg-white p-4 text-left shadow-[0_10px_28px_rgba(34,28,20,0.04)] transition hover:border-[#d7cdbe] hover:shadow-[0_16px_36px_rgba(34,28,20,0.07)]"
          >
            <PreviewSurface
              src={artifact?.imageUrl}
              title={item.title}
              subtitle={artifact?.caption}
              badge={artifact?.sourceLabel ?? 'Artifact'}
              className="aspect-[1.05/1] h-auto w-full"
            />
            <div className="mt-4 text-[17px] font-semibold leading-6 text-[#1b1915]">{item.title}</div>
            <div className="mt-2 text-[15px] leading-7 text-[#6b645a]">{item.description}</div>
          </button>
        );
      })}
    </div>
  );
}

function AssistantEnvelopeView({
  envelope,
  onChipClick,
  onCta,
  onOpenArtifact,
}: {
  envelope: AssistantEnvelope;
  onChipClick: (chip: PromptChip) => void;
  onCta: (action: UIAction, label: string) => void;
  onOpenArtifact: (artifactId: string, title: string) => void;
}) {
  const activeCaseId = envelope.selectedContext.kind === 'case' ? envelope.selectedContext.id : null;

  return (
    <div className="flex gap-5">
      <div className="mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef0ff] text-[22px] text-[#5b61ff] shadow-[inset_0_0_0_1px_rgba(91,97,255,0.08)]">
        ✦
      </div>
      <article className="min-w-0 flex-1 rounded-[36px] border border-[#e9e1d7] bg-white px-10 py-9 shadow-[0_16px_40px_rgba(31,26,20,0.05)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[18px] font-semibold text-[#11110f]">ИИ-ассистент</div>
          {envelope.meta.responseSource === 'facts_constrained_synthesis' ? (
            <span className="rounded-full border border-[#d9d1c6] bg-[#faf7f1] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b6257]">
              Только подтвержденные факты
            </span>
          ) : null}
        </div>

        <div className="mt-8 space-y-8">
          {envelope.contentBlocks.map((block, index) => {
            switch (block.type) {
              case 'lead':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-5">
                    <h3 className="text-[34px] font-semibold leading-[1.12] tracking-[-0.03em] text-[#11110f] lg:text-[56px]">
                      {block.title}
                    </h3>
                    <div className="space-y-4 text-[18px] leading-[1.9] text-[#4e4740]">
                      {block.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                );
              case 'section':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-4">
                    <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f] lg:text-[34px]">{block.title}</h3>
                    <div className="space-y-4 text-[17px] leading-[1.9] text-[#4e4740]">
                      {block.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                );
              case 'bullet_list':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-4">
                    {block.title ? <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3> : null}
                    <ul className="space-y-3 text-[17px] leading-[1.85] text-[#4e4740]">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#2d2923]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              case 'metrics':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-4">
                    {block.title ? <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3> : null}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {block.items.map((metric) => (
                        <div
                          key={`${metric.value}-${metric.label}`}
                          className="rounded-[26px] border border-[#e8e1d6] bg-[#fcfaf6] p-5"
                        >
                          <div className="text-[28px] font-semibold tracking-[-0.02em] text-[#11110f]">{metric.value}</div>
                          <div className="mt-2 text-[15px] leading-6 text-[#6b645a]">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              case 'chips':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-4">
                    {block.title ? <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3> : null}
                    <div className="flex flex-wrap gap-3">
                      {block.items.map((chip) => (
                        <PromptChipButton key={chip.id} chip={chip} onClick={onChipClick} emphasis />
                      ))}
                    </div>
                  </section>
                );
              case 'disclosures':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-4">
                    {block.title ? <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3> : null}
                    <div className="space-y-4">
                      {block.items.map((item) => (
                        <details
                          key={item.id}
                          className="group rounded-[28px] border border-[#e8e2d8] bg-[#fffdfa] px-6 py-5 shadow-[0_8px_24px_rgba(32,25,18,0.03)]"
                        >
                          <summary className="cursor-pointer list-none">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="text-[19px] font-semibold leading-7 text-[#171512]">{item.title}</div>
                                <div className="mt-3 text-[16px] leading-7 text-[#625b52]">{item.summary}</div>
                              </div>
                              <div className="mt-1 text-[20px] text-[#8f8578] transition group-open:rotate-45">+</div>
                            </div>
                          </summary>
                          <div className="mt-5 space-y-4 border-t border-[#eee7dd] pt-5 text-[16px] leading-[1.85] text-[#4f4940]">
                            {item.details.map((detail) => (
                              <p key={detail}>{detail}</p>
                            ))}
                            {item.artifactIds?.length ? (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {item.artifactIds.map((artifactId) => {
                                  const artifact = activeCaseId ? getArtifact(activeCaseId, artifactId) : undefined;
                                  return (
                                    <button
                                      key={artifactId}
                                      type="button"
                                      onClick={() => onOpenArtifact(artifactId, artifact?.title ?? artifactId)}
                                      className="rounded-full border border-[#ded5c9] bg-white px-4 py-2 text-[13px] font-medium text-[#5a5248] transition hover:border-[#cfc3b3] hover:bg-[#fffcf7]"
                                    >
                                      {artifact ? `Открыть: ${artifact.title}` : 'Открыть артефакт'}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                );
              case 'gallery':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-4">
                    {block.title ? <h3 className="text-[24px] font-semibold leading-[1.25] text-[#11110f]">{block.title}</h3> : null}
                    <Gallery items={block.items} caseId={activeCaseId} onOpenArtifact={onOpenArtifact} />
                  </section>
                );
              case 'cta':
                return (
                  <section key={`${block.type}-${index}`}>
                    <button
                      type="button"
                      onClick={() => onCta(block.action, block.label)}
                      className="rounded-full bg-[#13110f] px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-[#22201c]"
                    >
                      {block.label}
                    </button>
                  </section>
                );
              default:
                return null;
            }
          })}
        </div>

        {envelope.chips.length ? (
          <div className="mt-8 flex flex-wrap gap-3 border-t border-[#ece4d8] pt-6">
            {envelope.chips.map((chip) => (
              <PromptChipButton key={chip.id} chip={chip} onClick={onChipClick} emphasis />
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}

function ContextPanel({
  envelope,
  onAction,
}: {
  envelope: AssistantEnvelope;
  onAction: (action: UIAction, label?: string) => void;
}) {
  const panel = envelope.contextPanel;
  const contextPreview =
    envelope.selectedContext.kind === 'case'
      ? getCasePreview(envelope.selectedContext.id) ?? {
          title: envelope.selectedContext.label,
          subtitle: 'Подтвержденный кейс из портфолио.',
          imageUrl: undefined,
          badge: 'Case',
        }
      : envelope.selectedContext.kind === 'experience'
        ? {
            title: 'Опыт работы',
            subtitle: 'Компании, домены и траектория роста.',
            imageUrl: undefined,
            badge: 'Career',
          }
        : envelope.selectedContext.kind === 'overview'
          ? {
              title:
                envelope.selectedContext.id === 'mobile-experience'
                  ? 'Мобильный опыт'
                  : 'Дополнительные кейсы',
              subtitle:
                envelope.selectedContext.id === 'mobile-experience'
                  ? 'Ширина mobile signal за пределами флагмана.'
                  : 'Не остатки, а breadth с нормальным сигналом.',
              imageUrl: undefined,
              badge: 'Overview',
            }
          : {
              title: 'Стартовая точка',
              subtitle: 'Опыт, кейсы, доказательства и выход на связь.',
              imageUrl: undefined,
              badge: 'Desktop',
            };

  return (
    <aside className="rounded-[34px] border border-[#e8e1d7] bg-white p-5 shadow-[0_14px_36px_rgba(31,26,20,0.04)]">
      <PreviewSurface
        src={contextPreview.imageUrl}
        title={contextPreview.title}
        subtitle={contextPreview.subtitle}
        badge={contextPreview.badge}
        className="aspect-[1.25/1]"
      />

      <div className="mt-5">
        <div className="text-[28px] font-semibold tracking-[-0.03em] text-[#11110f]">{panel.title}</div>
        <div className="mt-2 text-[15px] text-[#7c746a]">{panel.subtitle}</div>
      </div>

      {panel.tags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {panel.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#ece5da] bg-[#faf7f1] px-3 py-1.5 text-[12px] font-medium text-[#665e54]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {panel.metrics?.length ? (
        <div className="mt-5 space-y-3 border-t border-[#eee7dd] pt-5">
          {panel.metrics.map((metric) => (
            <div key={`${metric.value}-${metric.label}`} className="flex items-start justify-between gap-3">
              <span className="text-[18px] font-semibold text-[#11110f]">{metric.value}</span>
              <span className="text-right text-[14px] leading-6 text-[#726a60]">{metric.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {panel.role ? (
        <div className="mt-5 border-t border-[#eee7dd] pt-5">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9a9083]">Роль</div>
          <div className="mt-2 text-[16px] font-semibold text-[#11110f]">{panel.role}</div>
          {panel.roleDescription ? (
            <div className="mt-2 text-[15px] leading-7 text-[#665f56]">{panel.roleDescription}</div>
          ) : null}
        </div>
      ) : null}

      {panel.note ? <div className="mt-5 text-[15px] leading-7 text-[#5e564d]">{panel.note}</div> : null}

      {panel.cta ? (
        <button
          type="button"
          onClick={() => onAction(panel.cta!.action, panel.cta!.label)}
          className="mt-6 w-full rounded-full bg-[#13110f] px-5 py-3.5 text-[15px] font-medium text-white transition hover:bg-[#22201c]"
        >
          {panel.cta.label}
        </button>
      ) : null}
    </aside>
  );
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

function ModalOverlay({
  envelope,
  onClose,
}: {
  envelope: AssistantEnvelope;
  onClose: () => void;
}) {
  if (!envelope.modal) {
    return null;
  }

  const modal = envelope.modal;
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
            <PreviewSurface
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

export function PortfolioShell() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<ThreadItem[]>([]);
  const [activeEnvelope, setActiveEnvelope] = useState<AssistantEnvelope | null>(null);
  const [modalEnvelope, setModalEnvelope] = useState<AssistantEnvelope | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const railItems = activeEnvelope?.railItems ?? [];
  const messagesRemaining = activeEnvelope?.meta.userMessagesRemaining ?? 0;
  const currentEnvelope =
    activeEnvelope ??
    [...timeline].reverse().find((item): item is Extract<ThreadItem, { kind: 'assistant' }> => item.kind === 'assistant')
      ?.envelope ??
    null;

  async function requestEnvelope(
    body: ChatRequestBody,
    options?: { userLabel?: string; appendAssistant?: boolean; appendUser?: boolean; showLoading?: boolean },
  ) {
    const shouldAppendAssistant = options?.appendAssistant ?? true;
    const shouldAppendUser = options?.appendUser ?? Boolean(options?.userLabel);
    const shouldShowLoading = options?.showLoading ?? true;
    const userLabel = options?.userLabel;

    if (userLabel && shouldAppendUser) {
      setTimeline((current) => [...current, { kind: 'user', text: renderActionLabel(userLabel) }]);
    }

    if (shouldShowLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, sessionId }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`);
      }

      const envelope = (await response.json()) as AssistantEnvelope;
      setSessionId(envelope.sessionId);

      if (isModalView(envelope)) {
        setModalEnvelope(envelope);
      } else {
        setModalEnvelope(null);
        setActiveEnvelope(envelope);
        if (shouldAppendAssistant) {
          setTimeline((current) => [...current, { kind: 'assistant', envelope }]);
        }
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unknown error');
    } finally {
      if (shouldShowLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/assistant/bootstrap');
        if (!response.ok) {
          throw new Error(`Bootstrap failed with ${response.status}`);
        }

        const envelope = (await response.json()) as AssistantEnvelope;
        if (cancelled) {
          return;
        }

        setSessionId(envelope.sessionId);
        setActiveEnvelope(envelope);
        setTimeline([{ kind: 'assistant', envelope }]);
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = '0px';

    const lineHeight = Number.parseFloat(globalThis.getComputedStyle(textarea).lineHeight) || 32;
    const verticalPadding = 32;
    const maxHeight = Math.round(lineHeight * 3 + verticalPadding);
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${Math.max(nextHeight, lineHeight + verticalPadding)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [input]);

  function handleChipClick(chip: PromptChip) {
    void requestEnvelope(
      { input: { type: 'action', action: chip.action }, sessionId: sessionId ?? undefined },
      { userLabel: chip.label },
    );
  }

  function handleRailClick(item: AssistantEnvelope['railItems'][number]) {
    if (selectedRailId === item.id) {
      return;
    }

    let action: UIAction;
    let label = item.label;

    switch (item.kind) {
      case 'case':
        action = { type: 'open_case_summary', caseId: item.id };
        label = `Открой ${item.label}`;
        break;
      case 'experience':
        action = { type: 'open_experience_summary' };
        label = 'Расскажи про опыт работы';
        break;
      case 'overview':
        action = { type: 'open_additional_cases_overview' };
        label = 'Покажи дополнительные кейсы';
        break;
      default:
        action = { type: 'open_entry' };
    }

    void requestEnvelope(
      { input: { type: 'action', action }, sessionId: sessionId ?? undefined },
      { userLabel: label },
    );
  }

  function handleCta(action: UIAction, label?: string) {
    const opensModal = action.type === 'open_contact_modal' || action.type === 'open_image_modal';

    void requestEnvelope(
      { input: { type: 'action', action }, sessionId: sessionId ?? undefined },
      {
        userLabel: label,
        appendUser: !opensModal,
        appendAssistant: action.type !== 'close_modal' && !opensModal,
        showLoading: !opensModal && action.type !== 'close_modal',
      },
    );
  }

  function handleOpenArtifact(artifactId: string, title: string) {
    if (!activeEnvelope || activeEnvelope.selectedContext.kind !== 'case') {
      return;
    }

    void requestEnvelope(
      {
        input: {
          type: 'action',
          action: {
            type: 'open_image_modal',
            caseId: activeEnvelope.selectedContext.id,
            artifactId,
          },
        },
        sessionId: sessionId ?? undefined,
      },
      {
        userLabel: `Открой артефакт: ${title}`,
        appendUser: false,
        appendAssistant: false,
        showLoading: false,
      },
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) {
      return;
    }

    setInput('');
    void requestEnvelope(
      { input: { type: 'message', text }, sessionId: sessionId ?? undefined },
      { userLabel: text },
    );
  }

  const selectedRailId = useMemo(() => {
    if (!activeEnvelope) {
      return null;
    }

    if (activeEnvelope.selectedContext.kind === 'case') {
      return activeEnvelope.selectedContext.id;
    }

    if (activeEnvelope.selectedContext.kind === 'experience') {
      return 'experience';
    }

    if (activeEnvelope.selectedContext.kind === 'overview') {
      return activeEnvelope.selectedContext.id;
    }

    return null;
  }, [activeEnvelope]);

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-[#f6f4ee] p-5 lg:hidden">
        <div className="max-w-md rounded-[32px] border border-[#e6dfd4] bg-white p-8 text-center shadow-[0_18px_44px_rgba(31,26,20,0.06)]">
          <div className="text-[26px] font-semibold tracking-[-0.03em] text-[#11110f]">Desktop-only V1</div>
          <p className="mt-4 text-[16px] leading-8 text-[#605950]">
            Мобильная версия в этот релиз сознательно не входит. Сейчас продукт собран как desktop-first assistant, а не как еще один расползающийся MVP.
          </p>
        </div>
      </div>

      <div className="hidden h-screen overflow-hidden bg-[#f6f4ee] px-6 py-7 lg:block">
        <div className="mx-auto grid h-full max-w-[1800px] grid-cols-[320px_minmax(0,1fr)] overflow-hidden rounded-[38px] border border-[#e6dfd4] bg-white shadow-[0_24px_80px_rgba(31,26,20,0.07)]">
          <aside className="flex min-h-0 flex-col overflow-hidden border-r border-[#ece5da] px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ebe4da] bg-[#f7f5f0] text-[20px] font-semibold text-[#8a8378]">
                AM
              </div>
              <div>
                <div className="text-[18px] font-semibold text-[#12110e]">Андрей Макаревич</div>
                <div className="mt-1 text-[15px] text-[#7a7268]">Product Designer</div>
              </div>
            </div>

            <div className="mt-10 text-[15px] font-semibold text-[#151310]">Навигация</div>
            <div className="mt-4 space-y-3 overflow-hidden">
              {railItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRailClick(item)}
                  disabled={selectedRailId === item.id}
                  aria-current={selectedRailId === item.id ? 'page' : undefined}
                  className="w-full text-left disabled:cursor-default"
                >
                  <RailPreview title={item.label} subtitle={item.subtitle} selected={selectedRailId === item.id} />
                </button>
              ))}
            </div>

            <div className="mt-auto rounded-[28px] border border-[#e8e1d7] bg-[#fbf9f4] p-5">
              <div className="text-[17px] font-semibold text-[#12110e]">Лимит сессии</div>
              <div className="mt-3 text-[15px] leading-7 text-[#655d53]">
                В V1 ассистент не болтает бесконечно. После 20 пользовательских сообщений он переводит разговор в прямой контакт.
              </div>
              <div className="mt-5 rounded-full border border-[#e6dfd4] bg-white px-4 py-2.5 text-[15px] font-medium text-[#544d44]">
                Осталось сообщений: {messagesRemaining}
              </div>
            </div>
          </aside>

          <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
            <header className="flex items-center justify-between border-b border-[#ece5da] px-9 py-6">
              <div>
                <div className="text-[22px] font-semibold tracking-[-0.03em] text-[#12110e]">AI Portfolio Assistant</div>
                <div className="mt-1 text-[15px] text-[#7a7268]">Desktop-first portfolio assistant с жёсткими границами и подтвержденным контентом.</div>
              </div>
              <button
                type="button"
                onClick={() => handleCta({ type: 'open_contact_modal', source: 'header' }, 'Написать Андрею')}
                className="rounded-full bg-[#13110f] px-6 py-3.5 text-[15px] font-medium text-white transition hover:bg-[#22201c]"
              >
                Написать Андрею
              </button>
            </header>

            <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_330px] gap-6 overflow-hidden px-6 py-6">
              <div className="flex min-h-0 flex-col overflow-hidden rounded-[36px] bg-[#faf8f4] p-6">
                <div className="min-h-0 flex-1 space-y-7 overflow-y-auto pr-2 pb-4">
                  {timeline.map((item, index) =>
                    item.kind === 'user' ? (
                      <UserBubble key={`user-${index}`} text={item.text} />
                    ) : (
                      <AssistantEnvelopeView
                        key={`assistant-${index}-${item.envelope.viewType}`}
                        envelope={item.envelope}
                        onChipClick={handleChipClick}
                        onCta={handleCta}
                        onOpenArtifact={handleOpenArtifact}
                      />
                    ),
                  )}

                  {loading ? (
                    <div className="flex gap-5">
                      <div className="mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef0ff] text-[22px] text-[#5b61ff]">
                        ✦
                      </div>
                      <div className="rounded-[28px] border border-[#e8e2d8] bg-white px-6 py-5 text-[15px] leading-7 text-[#6a6258] shadow-[0_12px_28px_rgba(31,26,20,0.04)]">
                        Ищу правильное состояние. Ассистент не должен стрелять в темноту.
                      </div>
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-[15px] leading-7 text-red-700">
                      Ошибка: {error}
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 border-t border-transparent bg-[#faf8f4] pt-1">
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-[34px] border border-[#e8e1d7] bg-white p-4 shadow-[0_16px_36px_rgba(31,26,20,0.05)]"
                  >
                  <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#a3998d]">Задать вопрос</div>
                  <div className="mt-3 flex items-end gap-4">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      rows={1}
                      placeholder="Спроси про опыт, кейсы, продуктовый подход или попроси открыть конкретный сценарий."
                      className="max-h-[128px] min-h-[64px] flex-1 resize-none rounded-[24px] border border-[#e7e0d5] bg-[#fffdfa] px-5 py-4 text-[16px] leading-8 text-[#1d1b17] outline-none transition placeholder:text-[#9a9185] focus:border-[#d4c6b3]"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-full bg-[#13110f] px-7 py-4 text-[16px] font-medium text-white transition hover:bg-[#22201c] disabled:cursor-not-allowed disabled:bg-[#c9c0b5]"
                    >
                      Отправить
                    </button>
                  </div>
                  </form>
                </div>
              </div>

              {currentEnvelope ? <ContextPanel envelope={currentEnvelope} onAction={handleCta} /> : null}
            </div>
          </section>
        </div>
      </div>

              {modalEnvelope ? (
        <ModalOverlay
          envelope={modalEnvelope}
          onClose={() => {
            void requestEnvelope(
              { input: { type: 'action', action: { type: 'close_modal' } }, sessionId: sessionId ?? undefined },
              { appendAssistant: false, appendUser: false, showLoading: false },
            );
          }}
        />
      ) : null}
    </>
  );
}
