export const MODEL_EXECUTION_BUDGET_MS = 12_000;
export const ROUTER_TIMEOUT_MS = 2_500;
export const MODEL_EXECUTION_MAX_CALLS = 2;

export type ModelCallKind = 'router' | 'synthesis';

export type ModelCallLease = {
  kind: ModelCallKind;
  callNumber: number;
  timeoutMs: number;
};

/**
 * A request-local, deliberately small execution budget for model calls.
 *
 * It is independent from a provider: both the semantic router and synthesis
 * must acquire a lease before making a network request. That makes the
 * two-call / twelve-second contract enforceable even when providers fail.
 */
export class ModelExecutionBudget {
  private readonly deadlineMs: number;
  private calls = 0;

  constructor(
    private readonly now: () => number = Date.now,
    private readonly totalMs = MODEL_EXECUTION_BUDGET_MS,
    private readonly maxCalls = MODEL_EXECUTION_MAX_CALLS,
  ) {
    this.deadlineMs = this.now() + totalMs;
  }

  get callsUsed() {
    return this.calls;
  }

  get remainingMs() {
    return Math.max(0, this.deadlineMs - this.now());
  }

  acquire(kind: ModelCallKind, requestedTimeoutMs: number): ModelCallLease | null {
    const remainingMs = this.remainingMs;
    if (this.calls >= this.maxCalls || remainingMs <= 0) {
      return null;
    }

    this.calls += 1;
    return {
      kind,
      callNumber: this.calls,
      timeoutMs: Math.max(1, Math.min(requestedTimeoutMs, remainingMs)),
    };
  }
}
