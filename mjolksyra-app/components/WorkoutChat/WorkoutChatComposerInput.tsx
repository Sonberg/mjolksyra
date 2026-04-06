type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function WorkoutChatComposerInput({ value, onChange }: Props) {
  return (
    <div className="min-h-11 min-w-0 flex-1 px-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
        placeholder="Write a message..."
        data-testid="workout-chat-composer"
        className="w-full min-h-10 resize-none border-0 bg-transparent py-2 text-sm leading-6 text-[var(--shell-ink)] outline-none placeholder:text-[var(--shell-muted)]"
      />
    </div>
  );
}
