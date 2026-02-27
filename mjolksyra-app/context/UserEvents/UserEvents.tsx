"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { HubConnection } from "@microsoft/signalr";
import { createUserEventsConnection } from "@/lib/userEventsConnection";
import { useAuth } from "@/context/Auth";

type EventHandler = (payload?: unknown) => void;

type UserEventsContextValue = {
  subscribe: (eventName: string, handler: EventHandler) => () => void;
};

const UserEventsContext = createContext<UserEventsContextValue>({
  subscribe: () => () => {},
});

export function useUserEvents() {
  return useContext(UserEventsContext);
}

type Props = {
  children: ReactNode;
};

export function UserEventsProvider({ children }: Props) {
  const auth = useAuth();
  const connectionRef = useRef<HubConnection | null>(null);
  const listenersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const dispatchersRef = useRef<Map<string, (payload?: unknown) => void>>(
    new Map(),
  );

  const subscribe = useCallback((eventName: string, handler: EventHandler) => {
    let listeners = listenersRef.current.get(eventName);
    if (!listeners) {
      listeners = new Set();
      listenersRef.current.set(eventName, listeners);
    }
    listeners.add(handler);

    if (!dispatchersRef.current.has(eventName)) {
      const dispatcher = (payload?: unknown) => {
        const current = listenersRef.current.get(eventName);
        if (!current) return;
        current.forEach((fn) => fn(payload));
      };
      dispatchersRef.current.set(eventName, dispatcher);
      connectionRef.current?.on(eventName, dispatcher);
    }

    return () => {
      const current = listenersRef.current.get(eventName);
      if (!current) return;
      current.delete(handler);

      if (current.size === 0) {
        listenersRef.current.delete(eventName);
        const dispatcher = dispatchersRef.current.get(eventName);
        if (dispatcher) {
          connectionRef.current?.off(eventName, dispatcher);
          dispatchersRef.current.delete(eventName);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      if (connectionRef.current) {
        void connectionRef.current.stop();
        connectionRef.current = null;
      }
      return;
    }

    const connection = createUserEventsConnection(
      async () => (await auth.getAccessToken()) ?? null,
    );
    if (!connection) return;

    dispatchersRef.current.forEach((dispatcher, eventName) => {
      connection.on(eventName, dispatcher);
    });

    connectionRef.current = connection;
    void connection
      .start()
      .catch((err) =>
        console.log("Failed to start user events connection", err),
      );

    return () => {
      if (connectionRef.current === connection) {
        connectionRef.current = null;
      }
      void connection.stop();
    };
  }, [auth]);

  const value = useMemo<UserEventsContextValue>(
    () => ({
      subscribe,
    }),
    [subscribe],
  );

  return (
    <UserEventsContext.Provider value={value}>
      {children}
    </UserEventsContext.Provider>
  );
}
