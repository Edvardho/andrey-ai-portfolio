'use client';

import { useEffect, useMemo, useState } from 'react';

import type {
  AssistantEnvelope,
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

function FallbackImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-100 text-center text-sm text-zinc-500 ${className ?? ''}`}>
        <div className="max-w-48 px-6 py-10">
          <div className="font-medium text-zinc-700">{alt}</div>
          <div className="mt-2 text-xs text-zinc-500">Для MVP здесь пока текстовая заглушка вместо ассета.</div>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
    />
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[640px] rounded-3xl bg-zinc-100 px-5 py-4 text-sm leading-6 text-zinc-900 shadow-sm">
        {text}
      </div>
    </div>
  );
}

function PromptChipButton({
  chip,
  onClick,
}: {
  chip: PromptChip;
  onClick: (chip: PromptChip) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(chip)}
      className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
    >
      {chip.label}
    </button>
  );
}

function Gallery({
  items,
  onOpenArtifact,
}: {
  items: GalleryItem[];
  onOpenArtifact: (artifactId: string, title: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onOpenArtifact(item.artifactId, item.title)}
          className="rounded-3xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-zinc-300 hover:shadow-md"
        >
          <div className="h-28 rounded-2xl bg-zinc-100" />
          <div className="mt-4 text-sm font-semibold text-zinc-900">{item.title}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</div>
        </button>
      ))}
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
  return (
    <div className="flex gap-4">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-lg text-indigo-500">✦</div>
      <div className="min-w-0 flex-1 rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-base font-semibold text-zinc-950">ИИ-ассистент</div>
        <div className="mt-5 space-y-6">
          {envelope.contentBlocks.map((block, index) => {
            switch (block.type) {
              case 'lead':
              case 'section':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-3">
                    <h3 className="text-xl font-semibold text-zinc-950">{block.title}</h3>
                    <div className="space-y-3 text-sm leading-7 text-zinc-700">
                      {block.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                );
              case 'bullet_list':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-3">
                    {block.title ? <h3 className="text-lg font-semibold text-zinc-950">{block.title}</h3> : null}
                    <ul className="space-y-3 text-sm leading-7 text-zinc-700">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-700" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              case 'metrics':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-3">
                    {block.title ? <h3 className="text-lg font-semibold text-zinc-950">{block.title}</h3> : null}
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {block.items.map((metric) => (
                        <div key={`${metric.value}-${metric.label}`} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                          <div className="text-lg font-semibold text-zinc-950">{metric.value}</div>
                          <div className="mt-1 text-sm text-zinc-600">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              case 'chips':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-3">
                    {block.title ? <h3 className="text-lg font-semibold text-zinc-950">{block.title}</h3> : null}
                    <div className="flex flex-wrap gap-3">
                      {block.items.map((chip) => (
                        <PromptChipButton key={chip.id} chip={chip} onClick={onChipClick} />
                      ))}
                    </div>
                  </section>
                );
              case 'disclosures':
                return (
                  <section key={`${block.type}-${index}`} className="space-y-3">
                    {block.title ? <h3 className="text-lg font-semibold text-zinc-950">{block.title}</h3> : null}
                    <div className="space-y-3">
                      {block.items.map((item) => (
                        <details key={item.id} className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                          <summary className="cursor-pointer list-none">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-sm font-semibold text-zinc-900">{item.title}</div>
                                <div className="mt-2 text-sm leading-6 text-zinc-600">{item.summary}</div>
                              </div>
                              <div className="text-zinc-400 transition group-open:rotate-45">+</div>
                            </div>
                          </summary>
                          <div className="mt-4 space-y-3 border-t border-zinc-200 pt-4 text-sm leading-7 text-zinc-700">
                            {item.details.map((detail) => (
                              <p key={detail}>{detail}</p>
                            ))}
                            {item.artifactIds?.length ? (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {item.artifactIds.map((artifactId) => (
                                  <button
                                    key={artifactId}
                                    type="button"
                                    onClick={() => onOpenArtifact(artifactId, artifactId)}
                                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                                  >
                                    Открыть артефакт
                                  </button>
                                ))}
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
                  <section key={`${block.type}-${index}`} className="space-y-3">
                    {block.title ? <h3 className="text-lg font-semibold text-zinc-950">{block.title}</h3> : null}
                    <Gallery items={block.items} onOpenArtifact={onOpenArtifact} />
                  </section>
                );
              case 'cta':
                return (
                  <section key={`${block.type}-${index}`}>
                    <button
                      type="button"
                      onClick={() => onCta(block.action, block.label)}
                      className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
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
          <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-200 pt-5">
            {envelope.chips.map((chip) => (
              <PromptChipButton key={chip.id} chip={chip} onClick={onChipClick} />
            ))}
          </div>
        ) : null}
      </div>
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

  return (
    <aside className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-xl font-semibold text-zinc-950">{panel.title}</div>
      <div className="mt-2 text-sm text-zinc-500">{panel.subtitle}</div>
      {panel.tags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {panel.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {panel.metrics?.length ? (
        <div className="mt-5 space-y-3 border-t border-zinc-200 pt-5">
          {panel.metrics.map((metric) => (
            <div key={`${metric.value}-${metric.label}`} className="flex items-start justify-between gap-3 text-sm">
              <span className="font-semibold text-zinc-900">{metric.value}</span>
              <span className="text-right text-zinc-500">{metric.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      {panel.role ? (
        <div className="mt-5 border-t border-zinc-200 pt-5">
          <div className="text-xs uppercase tracking-[0.16em] text-zinc-400">Роль</div>
          <div className="mt-2 text-sm font-semibold text-zinc-950">{panel.role}</div>
          {panel.roleDescription ? <div className="mt-2 text-sm leading-6 text-zinc-600">{panel.roleDescription}</div> : null}
        </div>
      ) : null}
      {panel.note ? <div className="mt-5 text-sm leading-6 text-zinc-600">{panel.note}</div> : null}
      {panel.cta ? (
        <button
          type="button"
          onClick={() => onAction(panel.cta!.action, panel.cta!.label)}
          className="mt-6 w-full rounded-full bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
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
      className="flex items-start justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-4 transition hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div>
        <div className="text-sm font-semibold text-zinc-950">{option.label}</div>
        <div className="mt-1 text-sm leading-6 text-zinc-500">{option.helper}</div>
      </div>
      <div className="text-zinc-400">↗</div>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-6 py-10">
      <button type="button" aria-label="Закрыть" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl rounded-[36px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-2xl font-semibold text-zinc-950">{envelope.modal.title}</div>
            {'helper' in envelope.modal ? <div className="mt-2 text-sm text-zinc-500">{envelope.modal.helper}</div> : null}
            {'caption' in envelope.modal ? <div className="mt-2 text-sm text-zinc-500">{envelope.modal.caption}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            ×
          </button>
        </div>

        {envelope.modal.type === 'contact' ? (
          <div className="mt-6 space-y-3">
            {envelope.modal.options.map((option) => (
              <ContactOptionRow key={option.id} option={option} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] border border-zinc-200 bg-zinc-50 p-4">
            <FallbackImage
              src={envelope.modal.imageUrl}
              alt={envelope.modal.title}
              className="max-h-[70vh] w-full rounded-[24px] object-contain"
            />
            {envelope.modal.note ? <div className="mt-4 text-sm leading-6 text-zinc-500">{envelope.modal.note}</div> : null}
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

  const railItems = activeEnvelope?.railItems ?? [];
  const messagesRemaining = activeEnvelope?.meta.userMessagesRemaining ?? 0;
  const currentEnvelope =
    activeEnvelope ??
    [...timeline].reverse().find((item): item is Extract<ThreadItem, { kind: 'assistant' }> => item.kind === 'assistant')
      ?.envelope ??
    null;

  async function requestEnvelope(
    body: ChatRequestBody,
    options?: { userLabel?: string; appendAssistant?: boolean },
  ) {
    const shouldAppendAssistant = options?.appendAssistant ?? true;
    const userLabel = options?.userLabel;

    if (userLabel) {
      setTimeline((current) => [...current, { kind: 'user', text: renderActionLabel(userLabel) }]);
    }

    setLoading(true);
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
      setLoading(false);
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

  function handleChipClick(chip: PromptChip) {
    void requestEnvelope(
      { input: { type: 'action', action: chip.action }, sessionId: sessionId ?? undefined },
      { userLabel: chip.label },
    );
  }

  function handleRailClick(item: AssistantEnvelope['railItems'][number]) {
    let action: UIAction;
    let label = item.label;

    switch (item.kind) {
      case 'case':
        action = { type: 'open_case_route', caseId: item.id };
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

    void requestEnvelope({ input: { type: 'action', action }, sessionId: sessionId ?? undefined }, { userLabel: label });
  }

  function handleCta(action: UIAction, label?: string) {
    void requestEnvelope(
      { input: { type: 'action', action }, sessionId: sessionId ?? undefined },
      { userLabel: label, appendAssistant: action.type !== 'close_modal' },
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
      { userLabel: `Открой артефакт: ${title}`, appendAssistant: false },
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4 lg:hidden">
        <div className="max-w-md rounded-[28px] border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="text-xl font-semibold text-zinc-950">Desktop-only V1</div>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            Мобильная версия в этот релиз сознательно не входит. Сейчас продукт собран как desktop-first assistant, а не как еще один расползающийся MVP.
          </p>
        </div>
      </div>

      <div className="hidden min-h-screen bg-zinc-100 px-6 py-8 lg:block">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1580px] rounded-[36px] border border-zinc-200 bg-white shadow-sm">
          <aside className="flex w-[290px] shrink-0 flex-col border-r border-zinc-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-500">AM</div>
              <div>
                <div className="text-sm font-semibold text-zinc-950">Андрей Макаревич</div>
                <div className="text-sm text-zinc-500">Product Designer</div>
              </div>
            </div>

            <div className="mt-8 text-sm font-semibold text-zinc-950">Навигация</div>
            <div className="mt-4 space-y-3">
              {railItems.map((item) => {
                const selected = selectedRailId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRailClick(item)}
                    className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                      selected
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                        : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className={`mt-1 text-sm ${selected ? 'text-zinc-300' : 'text-zinc-500'}`}>{item.subtitle}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto rounded-[24px] border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-sm font-semibold text-zinc-950">Лимит сессии</div>
              <div className="mt-2 text-sm leading-6 text-zinc-600">
                В V1 ассистент не болтает бесконечно. После 20 пользовательских сообщений он переводит разговор в прямой контакт.
              </div>
              <div className="mt-4 rounded-full bg-white px-3 py-2 text-sm font-medium text-zinc-700">
                Осталось сообщений: {messagesRemaining}
              </div>
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-zinc-200 px-8 py-5">
              <div>
                <div className="text-2xl font-semibold text-zinc-950">AI Portfolio Assistant</div>
                <div className="mt-1 text-sm text-zinc-500">Stateful desktop-only MVP, а не свободный чат без границ.</div>
              </div>
              <button
                type="button"
                onClick={() => handleCta({ type: 'open_contact_modal', source: 'header' }, 'Написать Андрею')}
                className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Написать Андрею
              </button>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-6 p-6">
              <div className="flex min-h-0 flex-col rounded-[32px] bg-zinc-50 p-6">
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-2">
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
                    <div className="flex gap-4">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-lg text-indigo-500">✦</div>
                      <div className="rounded-[28px] border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-500 shadow-sm">
                        Ищу правильное состояние. Ассистент не должен стрелять в темноту.
                      </div>
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                      Ошибка: {error}
                    </div>
                  ) : null}
                </div>

                <form onSubmit={handleSubmit} className="mt-6 rounded-[32px] border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-zinc-400">Задать вопрос</div>
                  <div className="mt-3 flex items-end gap-3">
                    <textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      rows={3}
                      placeholder="Спроси про опыт, кейсы, продуктовый подход или попроси открыть конкретный сценарий."
                      className="min-h-24 flex-1 resize-none rounded-2xl border border-zinc-200 px-4 py-3 text-sm leading-7 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-300"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                    >
                      Отправить
                    </button>
                  </div>
                </form>
              </div>

              {currentEnvelope ? <ContextPanel envelope={currentEnvelope} onAction={handleCta} /> : null}
            </div>
          </main>
        </div>
      </div>

      {modalEnvelope ? (
        <ModalOverlay
          envelope={modalEnvelope}
          onClose={() => {
            void requestEnvelope(
              { input: { type: 'action', action: { type: 'close_modal' } }, sessionId: sessionId ?? undefined },
              { appendAssistant: false },
            );
          }}
        />
      ) : null}
    </>
  );
}
