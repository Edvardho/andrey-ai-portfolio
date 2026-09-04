'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import { portfolioLanding } from '@/data/portfolio-landing';
import { portfolioProfile } from '@/data/portfolio-profile';
import type { RailItem } from '@/lib/portfolio/types';
import { portfolioFocusRing } from './portfolio-interaction-styles';

const PROJECT_SCROLL_STEP = 294;
const PROJECT_FAN_EXPAND_DURATION_MS = 700;

function ProjectCard({
  projectIndex,
  onClick,
}: {
  projectIndex: number;
  onClick: () => void;
}) {
  const project = portfolioLanding.projects[projectIndex];

  return (
    <div
      className="portfolio-landing-project-card-wrap"
      style={{
        '--project-index': projectIndex,
        '--project-rotation': `${project.rotation}deg`,
        '--project-fan-offset': `${-(55 + projectIndex * 110)}px`,
      } as React.CSSProperties}
    >
      <button
        type="button"
        onClick={onClick}
        className={[
          'group flex w-[270px] shrink-0 cursor-pointer flex-col items-start overflow-hidden rounded-[24px] bg-white text-left shadow-[0_6px_15px_rgba(0,0,0,0.14)]',
          'transition-shadow duration-200 hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)]',
          portfolioFocusRing,
        ].join(' ')}
        aria-label={`Открыть кейс: ${project.title}`}
      >
        <div className="flex w-full shrink-0 flex-col items-start rounded-[24px] border-x-4 border-t-4 border-white bg-[#F7F8FA]">
          <div className="relative h-[180px] w-full shrink-0 overflow-hidden">
            <Image
              src={project.image.src}
              alt=""
              aria-hidden="true"
              width={project.image.width}
              height={project.image.height}
              sizes="270px"
              className={project.image.imageClassName}
            />
          </div>
          <div className="flex w-full shrink-0 flex-col items-start gap-2 overflow-hidden p-4 [word-break:break-word]">
            <h3 className="w-full text-[17px] font-medium leading-[normal] text-[#171920]">{project.title}</h3>
            <p className="w-full text-[13px] leading-[normal] text-[#5E606A]">{project.subtitle}</p>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col items-start rounded-[12px] bg-white px-4 pb-3 pt-2">
          <p className="w-full whitespace-pre-wrap text-[13px] font-medium leading-[normal] text-[#30313A] [word-break:break-word]">
            {project.result}
          </p>
        </div>
      </button>
    </div>
  );
}

export function PortfolioLandingView({
  railItems,
  onRailClick,
  onContactClick,
}: {
  railItems: RailItem[];
  onRailClick: (item: RailItem) => void;
  onContactClick: () => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const projectExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [scrollState, setScrollState] = useState({ atStart: true, atEnd: false });
  const caseItemsById = useMemo(
    () => new Map(railItems.filter((item) => item.kind === 'case').map((item) => [item.id, item])),
    [railItems],
  );

  const projects = portfolioLanding.projects
    .map((project) => ({ project, item: caseItemsById.get(project.id) }))
    .filter((entry): entry is { project: (typeof portfolioLanding.projects)[number]; item: RailItem } => Boolean(entry.item));

  function updateScrollState() {
    const rail = railRef.current;
    if (!rail) return;
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    setScrollState({
      atStart: rail.scrollLeft <= 1,
      atEnd: rail.scrollLeft >= max - 1,
    });
  }

  function scrollProjects(direction: 'left' | 'right') {
    railRef.current?.scrollBy({
      left: direction === 'left' ? -PROJECT_SCROLL_STEP : PROJECT_SCROLL_STEP,
      behavior: 'smooth',
    });
  }

  function clearProjectExpandTimer() {
    if (projectExpandTimerRef.current !== null) {
      clearTimeout(projectExpandTimerRef.current);
      projectExpandTimerRef.current = null;
    }
  }

  function expandProjects() {
    setExpanded(true);

    if (scrollEnabled || projectExpandTimerRef.current !== null) return;

    projectExpandTimerRef.current = setTimeout(() => {
      projectExpandTimerRef.current = null;
      setScrollEnabled(true);
      requestAnimationFrame(updateScrollState);
    }, PROJECT_FAN_EXPAND_DURATION_MS);
  }

  function collapseProjects() {
    clearProjectExpandTimer();
    setScrollEnabled(false);
    railRef.current?.scrollTo({ left: 0, behavior: 'auto' });
    setScrollState({ atStart: true, atEnd: false });
    setExpanded(false);
  }

  useEffect(() => clearProjectExpandTimer, []);

  return (
    <main className="portfolio-landing min-h-[100dvh] overflow-x-clip bg-white text-[#171920]">
      <header className="portfolio-landing-header-shell sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md max-md:bg-white max-md:backdrop-blur-none">
        <div className="portfolio-landing-header mx-auto flex h-[84px] w-full max-w-[1124px] items-center justify-between">
          <div className="flex min-w-0 items-start gap-2.5 whitespace-nowrap md:items-center">
            <span className="text-[15px] font-semibold leading-5 text-[#1A1D23]">{portfolioLanding.name}</span>
            <span className="text-[14px] leading-[18px] text-[#C6C8D0]">•</span>
            <span className="text-[14px] leading-[18px] text-[#9DA1AE]">{portfolioLanding.role}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/cv/andrey-makarevich-product-designer.pdf"
              download
              aria-label="Скачать CV"
              className={`inline-flex min-h-11 items-center justify-center rounded-full bg-[#ECECF1] px-[18px] py-2 text-[15px] font-medium leading-5 text-[#202129] transition-colors hover:bg-[#E2E3E9] ${portfolioFocusRing}`}
            >
              <span className="hidden md:inline">Скачать CV</span>
              <span className="inline md:hidden">CV</span>
            </a>
            <button
              type="button"
              onClick={onContactClick}
              className={`inline-flex min-h-11 items-center justify-center rounded-full bg-[#1A1C22] px-[18px] py-2 text-[15px] font-medium leading-5 text-white transition-colors hover:bg-[#30333D] ${portfolioFocusRing}`}
            >
              Написать мне
            </button>
          </div>
        </div>
      </header>

      <div className="portfolio-landing-content mx-auto w-full max-w-[1124px] pb-[46px] pt-6">
        <section className="flex flex-col items-center pt-6 text-center">
          <div className="flex items-start justify-center gap-4">
            <div className="relative mt-1 size-[86px] shrink-0 rotate-[-3deg] overflow-hidden rounded-[24px] border-4 border-white shadow-[0_6px_8px_rgba(0,0,0,0.16)]">
              <Image
                src={portfolioProfile.portrait.src}
                alt="Андрей Макаревич"
                fill
                sizes="86px"
                className="object-cover"
                style={{ objectPosition: portfolioProfile.portrait.focalPosition }}
                priority
              />
            </div>
            <h1 className="portfolio-landing-title text-[68px] font-semibold leading-[84px] tracking-[-0.045em] text-[#11131A]">
              <span className="hidden md:inline">{portfolioLanding.name}</span>
              <span className="inline md:hidden">Андрей<br />Макаревич</span>
            </h1>
          </div>
          <p className="mt-4 max-w-[842px] text-[20px] leading-6 text-[#373C50]">
            {portfolioLanding.description}
          </p>
          <div className="portfolio-landing-tags no-scrollbar mt-7 max-w-full overflow-hidden pb-1">
            <div className="portfolio-landing-tags-track">
              {[0, 1, 2].map((copyIndex) => (
                <div
                  key={copyIndex}
                  className="portfolio-landing-tags-group"
                  aria-hidden={copyIndex === 0 ? undefined : true}
                >
                  {portfolioLanding.tags.map((tag) => (
                    <span key={tag} className="shrink-0 rounded-full border border-[#E1E1E7] px-4 py-[11px] text-[15px] font-medium leading-5 text-[#646771]">
                      {tag}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="portfolio-landing-experience mt-12 pt-6" aria-labelledby="experience-title">
          <h2 id="experience-title" className="text-[24px] font-semibold leading-[30px] text-[#171920]">Где работал</h2>
          <ol className="portfolio-landing-experience-rail no-scrollbar mt-4 flex overflow-hidden" tabIndex={0} aria-label="Опыт работы">
            {portfolioLanding.experience.map((item) => (
              <li key={item.company} className="portfolio-landing-experience-item min-w-0 flex-1">
                <p className="text-[13px] leading-[18px] text-[#6E7280]">{item.period}</p>
                <h3 className="mt-[3px] text-[17px] font-semibold leading-[22px] text-[#171920]">{item.company}</h3>
                <p className="mt-[3px] pr-6 text-[13px] leading-[18px] text-[#6E7280]">{item.role}</p>
                <div className="mt-4 flex items-center gap-2 px-[5px] py-1" aria-hidden="true">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#A9ADB8] ring-2 ring-white" />
                  <span className="h-[1.5px] flex-1 bg-[#DADCE2]" />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className={`portfolio-landing-projects mt-12 pb-6 ${expanded ? 'is-expanded' : ''} ${scrollEnabled ? 'is-scrollable' : ''}`}
          aria-labelledby="projects-title"
          onMouseEnter={expandProjects}
          onMouseLeave={collapseProjects}
          onFocus={expandProjects}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) collapseProjects();
          }}
        >
          <div className="flex items-center gap-4">
            <h2 id="projects-title" className="text-[24px] font-semibold leading-[30px] text-[#171920]">Кейсы</h2>
            <div className="min-w-0 flex-1" />
            <div className="portfolio-landing-project-controls flex items-center gap-2.5">
              <button type="button" onClick={() => scrollProjects('left')} disabled={scrollState.atStart} aria-label="Прокрутить проекты влево" className={`portfolio-landing-arrow ${portfolioFocusRing}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/entry/icon-chevron-left.svg" alt="" className="size-4" />
              </button>
              <button type="button" onClick={() => scrollProjects('right')} disabled={scrollState.atEnd} aria-label="Прокрутить проекты вправо" className={`portfolio-landing-arrow ${portfolioFocusRing}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/entry/icon-chevron-right.svg" alt="" className="size-4" />
              </button>
            </div>
          </div>
          <div ref={railRef} onScroll={updateScrollState} className="portfolio-landing-project-rail no-scrollbar mt-6 overflow-x-auto overflow-y-visible" tabIndex={0} aria-label="Список проектов">
            <div className="portfolio-landing-project-track">
              {projects.map(({ item }, index) => <ProjectCard key={item.id} projectIndex={index} onClick={() => onRailClick(item)} />)}
            </div>
          </div>
        </section>
      </div>

      <footer className="portfolio-landing-footer mx-auto max-w-[1124px] border-t border-[#ECECF0] py-6 text-[13px] leading-[18px] text-[#8C8F9B]">
        © {new Date().getFullYear()} Андрей Макаревич. Дизайн портфолио.
      </footer>

      <button type="button" onClick={onContactClick} className={`portfolio-landing-mobile-contact fixed z-20 min-h-12 rounded-full bg-[#1A1C22] px-6 text-[15px] font-medium leading-5 text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] ${portfolioFocusRing}`}>
        Написать мне
      </button>
    </main>
  );
}
