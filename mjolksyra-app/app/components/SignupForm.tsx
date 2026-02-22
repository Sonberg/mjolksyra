"use client";

import { ApiClient } from "@/services/client";
import { Spinner } from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import { useValidation } from "@/hooks/useValidation";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setSubmitted] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const validation = useValidation({
    schema,
    values: { email },
  });

  async function onSubmit() {
    if (!validation.success) return;
    setLoading(true);
    await ApiClient.post("/api/signup", validation.parsed);
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="w-full flex flex-col items-start gap-4">
      <div className="text-sm text-zinc-400">Want to stay in touch?</div>
      <Input
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
        placeholder="Your email"
        className="border-white/15 bg-zinc-900/80 text-white placeholder:text-zinc-500"
      />
      <button
        className="rounded-xl border border-zinc-500 bg-zinc-100 px-6 py-3 font-semibold text-black transition hover:bg-zinc-300 disabled:opacity-50"
        disabled={isSubmitted}
        onClick={onSubmit}
      >
        {isLoading ? <Spinner size={8} /> : null}
        {isSubmitted ? "Thank you!" : "Sign me up"}
      </button>
    </div>
  );
}; 
