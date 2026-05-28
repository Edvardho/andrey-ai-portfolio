'use client';

import { motion } from 'framer-motion';

import { PortfolioAvailabilityPill } from './portfolio-availability-pill';
import { PortfolioButton } from './portfolio-button';

const SOFT_EASE = [0.16, 1, 0.3, 1] as const;

export function PortfolioDesktopHeader({
  onContactClick,
  ctaSource,
  showDivider,
}: {
  onContactClick: (source: 'entry' | 'header') => void;
  ctaSource: 'entry' | 'header';
  showDivider: boolean;
}) {
  return (
    <motion.header
      animate={{ borderColor: showDivider ? '#EBEDF2' : 'rgba(235,237,242,0)' }}
      transition={{ duration: 0.4, ease: SOFT_EASE }}
      className="flex h-[84px] shrink-0 items-center justify-between border-b"
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
    </motion.header>
  );
}
