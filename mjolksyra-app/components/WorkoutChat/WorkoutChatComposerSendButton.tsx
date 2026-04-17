import { Button } from "@/components/ui/button";
import { LoaderCircle, SendIcon } from "lucide-react";

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
      {isSending ? (
        <LoaderCircle data-icon="inline-start" className="animate-spin" />
      ) : (
        <SendIcon data-icon="inline-start" />
      )}
      {isSending ? "Sending..." : "Send"}
    </Button>
  );
}
