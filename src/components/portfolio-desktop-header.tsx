'use client';

import { motion } from 'framer-motion';

import { WORKSPACE_EASE } from './portfolio-motion';
import { PortfolioAvailabilityPill } from './portfolio-availability-pill';
import { PortfolioButton } from './portfolio-button';

export function PortfolioDesktopHeader({
  onContactClick,
  ctaSource,
  showDivider,
  constrainToLandingFrame = false,
}: {
  onContactClick: (source: 'entry' | 'header') => void;
  ctaSource: 'entry' | 'header';
  showDivider: boolean;
  constrainToLandingFrame?: boolean;
}) {
  return (
    <motion.header
      animate={{ borderColor: showDivider ? '#EBEDF2' : 'rgba(235,237,242,0)' }}
      transition={{ duration: 0.4, ease: WORKSPACE_EASE }}
      className="h-[84px] shrink-0 border-b"
    >
      <div
        className={
          constrainToLandingFrame
            ? 'portfolio-desktop-frame mx-auto flex h-full items-center justify-between'
            : 'flex h-full items-center justify-between'
        }
      >
        <div className="flex items-center gap-[10px] whitespace-nowrap">
          <span className="text-[15px] font-semibold leading-5 text-[#1a1d23]">Андрей Макаревич</span>
          <span className="text-[14px] leading-[18px] text-[#c6c8d0]">•</span>
          <span className="text-[14px] leading-[18px] text-[#9da1ae]">Product Designer</span>
        </div>

        <div className="flex items-center gap-3">
          <PortfolioAvailabilityPill />
          <PortfolioButton onClick={() => onContactClick(ctaSource)}>Написать мне</PortfolioButton>
        </div>
      </div>
    </motion.header>
  );
}
