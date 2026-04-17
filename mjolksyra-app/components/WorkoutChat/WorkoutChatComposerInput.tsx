import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function WorkoutChatComposerInput({ value, onChange }: Props) {
  return (
    <div className="min-h-11 min-w-0 flex-1 px-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
        placeholder="Write a message..."
        data-testid="workout-chat-composer"
        className="min-h-10 resize-none border-0 bg-transparent py-2 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
