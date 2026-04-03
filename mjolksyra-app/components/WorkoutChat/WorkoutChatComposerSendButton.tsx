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
      className="min-h-10 shrink-0 self-stretch border border-transparent bg-[var(--shell-accent)] px-3 text-[11px] font-semibold text-[var(--shell-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
    >
      {isSending ? "Sending..." : "Send"}
    </button>
  );
}
