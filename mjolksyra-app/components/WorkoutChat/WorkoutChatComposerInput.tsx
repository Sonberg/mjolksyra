type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function WorkoutChatComposerInput({ value, onChange }: Props) {
  return (
    <div className="min-h-10 min-w-0 flex-1 border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
        placeholder="Write a message..."
        data-testid="workout-chat-composer"
        className="w-full min-h-9 resize-none border-0 bg-transparent py-1.5 text-sm leading-5 text-[var(--shell-ink)] outline-none placeholder:text-[var(--shell-muted)]"
      />
    </div>
  );
}
