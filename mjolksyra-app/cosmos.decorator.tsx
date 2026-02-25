import { Providers } from "./app/providers";

export default function CosmosDecorator({ children }: any) {
  return <Providers>{children}</Providers>;
}
