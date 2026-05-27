'use client';

import { getCaseById } from '@/data/portfolio-content';
import type { AssistantEnvelope, PromptChip, UIAction } from '@/lib/portfolio/types';
import { PortfolioPromptChip } from './portfolio-prompt-chip';
import { PortfolioGallery } from './portfolio-gallery';

function getArtifact(caseId: string, artifactId: string) {
  return getCaseById(caseId)?.artifacts.find((artifact) => artifact.id === artifactId);
}

export function PortfolioAssistantEnvelopeView({
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
                        <PortfolioPromptChip key={chip.id} chip={chip} onClick={onChipClick} emphasis />
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
                          <summary className="cursor-pointer list-none outline-none">
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
                    <PortfolioGallery items={block.items} caseId={activeCaseId} onOpenArtifact={onOpenArtifact} />
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
              <PortfolioPromptChip key={chip.id} chip={chip} onClick={onChipClick} emphasis />
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}
