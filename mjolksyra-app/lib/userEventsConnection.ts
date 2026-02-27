"use client";

import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
  type IHttpConnectionOptions,
  LogLevel,
} from "@microsoft/signalr";

declare global {
  interface Window {
    __DISABLE_REALTIME__?: boolean;
  }
}

export function createUserEventsConnection(
  getAccessToken?: () => Promise<string | null>,
): HubConnection | null {
  if (typeof window === "undefined" || window.__DISABLE_REALTIME__) {
    return null;
  }

  const directApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const sameOriginAsApp =
    !!directApiUrl && new URL(directApiUrl).origin === window.location.origin;
  const useDirectWebSockets = !!directApiUrl && !sameOriginAsApp;
  const hubUrl = useDirectWebSockets ? `${directApiUrl}/api/events/hub` : "/api/events/hub";
  const options: IHttpConnectionOptions = {
    accessTokenFactory: async () => (await getAccessToken?.()) ?? "",
    transport: HttpTransportType.WebSockets,
    skipNegotiation: true,
  };

  const connection = new HubConnectionBuilder()
    .withUrl(hubUrl, options)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Error)
    .build();

  return connection;
}
