import { md5 } from "@/lib/md5";
import { useMemo } from "react";

const md5hex = (input: string): string =>
  Array.from(md5(input))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");

const toGravatar = (email: string, size?: number) => {
  return email
    ? `https://www.gravatar.com/avatar/${md5hex(email)}?d=mp${size ? `&s=${size}` : ""}`
    : "";
};

export const useGravatar = (email: string, size?: number): string => {
  return useMemo(() => toGravatar(email, size), [email, size]);
};
