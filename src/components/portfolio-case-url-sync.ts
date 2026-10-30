'use client';

import { useEffect, useRef, useState } from 'react';
import { isCaseId, type CaseId } from '@/data/portfolio-index';
import { buildCaseLink, readCaseLink } from '@/lib/portfolio/case-links';

// URL is a navigation address, never a second conversation/session store.
export function usePortfolioCaseUrlSync({
  enabled, activeCaseId, onCase, onHome,
}: {
  enabled: boolean;
  activeCaseId: string | null;
  onCase: (caseId: CaseId) => Promise<void>;
  onHome: () => void;
}) {
  const callbacks = useRef({ onCase, onHome });
  const replaying = useRef(false);
  const initialized = useRef(false);
  const lastReplayedVersion = useRef(0);
  const replaySequence = useRef(0);
  const [replayVersion, setReplayVersion] = useState(0);

  useEffect(() => { callbacks.current = { onCase, onHome }; }, [onCase, onHome]);

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    const onPopState = async () => {
      const sequence = ++replaySequence.current;
      replaying.current = true;
      const target = readCaseLink(globalThis.location.search);
      try {
        if (target.caseId) await callbacks.current.onCase(target.caseId);
        else callbacks.current.onHome();
      } finally {
        if (!disposed && sequence === replaySequence.current) {
          replaying.current = false;
          setReplayVersion((version) => version + 1);
        }
      }
    };
    globalThis.addEventListener('popstate', onPopState);
    return () => {
      disposed = true;
      globalThis.removeEventListener('popstate', onPopState);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || replaying.current) return;
    const currentUrl = `${globalThis.location.pathname}${globalThis.location.search}${globalThis.location.hash}`;
    const nextUrl = buildCaseLink(currentUrl, activeCaseId && isCaseId(activeCaseId) ? activeCaseId : null);
    if (nextUrl !== currentUrl) {
      // Hydration and history replay normalize in place; user navigation adds history.
      const method = initialized.current && replayVersion === lastReplayedVersion.current ? 'pushState' : 'replaceState';
      globalThis.history[method](null, '', nextUrl);
    }
    initialized.current = true;
    lastReplayedVersion.current = replayVersion;
  }, [enabled, activeCaseId, replayVersion]);
}
