export function ChatMessageTyping() {
  return (
    <span className="flex gap-1">
      <span
        className="blocks-pulse size-1.5 bg-[var(--shell-muted)]"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="blocks-pulse size-1.5 bg-[var(--shell-muted)]"
        style={{ animationDelay: "200ms" }}
      />
      <span
        className="blocks-pulse size-1.5 bg-[var(--shell-muted)]"
        style={{ animationDelay: "400ms" }}
      />
    </span>
  );
}
