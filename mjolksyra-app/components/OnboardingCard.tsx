import { ReactNode } from "react";

type Props = {
  title?: string;
  text?: string;
  button?: ReactNode;
};

export function OnboardingCard({ text, title, button }: Props) {
  return (
    <div className="mb-16 bg-[#c6b9ff] text-black p-6 rounded-xl">
      {title ? (
        <div className="text-3xl font-semibold" children={title} />
      ) : null}
      {text ? <div className="py-4 text-lg" children={text} /> : null}
      {button ? <div className="mt-4">{button}</div> : null}
    </div>
  );
}
