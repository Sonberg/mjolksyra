"use client";

import { ApiClient } from "@/services/client";
import { Spinner } from "@/components/Spinner";
import { useParams } from "next/navigation";
import { useEffect } from "react";

type Link = { url: string; error: string };

export default function Refresh() {
  const { connectedAccountId } = useParams();

  useEffect(() => {
    ApiClient.post<Link>("/api/stripe/account/link", {
      accountId: connectedAccountId,
      baseUrl: location.origin,
    })
      .then(({ data }) => {
        if (data.url) {
          window.location.href = data.url;
          return;
        }

        window.location.href = "/app/coach";
      })
      .catch(() => {
        window.location.href = "/app/coach";
      });
  }, [connectedAccountId]);

  return (
    <div className="grid place-content-center h-full">
      <Spinner size={48} className="opacity-40" />
    </div>
  );
}
