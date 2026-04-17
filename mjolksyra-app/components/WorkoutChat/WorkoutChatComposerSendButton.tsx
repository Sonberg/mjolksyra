import { Button } from "@/components/ui/button";

type Props = {
  isSending: boolean;
  canSend: boolean;
  onSend: () => void;
};

export function WorkoutChatComposerSendButton({ isSending, canSend, onSend }: Props) {
  return (
    <Button
      type="button"
      size="sm"
      disabled={!canSend || isSending}
      onClick={onSend}
      className="shrink-0 self-end"
    >
      {isSending ? "Sending..." : "Send"}
    </Button>
  );
}
