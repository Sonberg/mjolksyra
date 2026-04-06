type Props = {
  isSending: boolean;
  canSend: boolean;
  onSend: () => void;
};

export function WorkoutChatComposerSendButton({ isSending, canSend, onSend }: Props) {
  return (
    <button
      type="button"
      disabled={!canSend || isSending}
      onClick={onSend}
      className="shrink-0 self-end border border-transparent bg-[var(--shell-accent)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
    >
      {isSending ? "Sending..." : "Send"}
    </button>
  );
}
