"use client"

import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useEffect } from "react"
import type { AxiosRequestConfig } from "axios"
import { NavigationNotifications } from "./NavigationNotifications"
import { AuthContext, type AuthContextValue } from "@/context/Auth/Auth"
import { ApiClient } from "@/services/client"

declare global {
  interface Window {
    __DISABLE_REALTIME__?: boolean
  }
}

const mockAuth: AuthContextValue = {
  userId: "cosmos-user",
  name: "Per Sonberg",
  email: "per@example.com",
  givenName: "Per",
  familyName: "Sonberg",
  isAuthenticated: true,
  login() {},
  logout() {},
  getAccessToken: async () => null,
}

type MockNotification = {
  id: string
  type: string
  title: string
  body: string | null
  href: string | null
  createdAt: string
  readAt: string | null
}

function Fixture({
  items,
}: {
  items: MockNotification[]
}) {
  useEffect(() => {
    const originalGet = ApiClient.get.bind(ApiClient)
    const originalPost = ApiClient.post.bind(ApiClient)

    let notifications = [...items]

    ApiClient.get = (async (url: string) => {
      if (String(url).startsWith("/api/notifications")) {
        return {
          data: {
            unreadCount: notifications.filter((x) => !x.readAt).length,
            items: notifications,
          },
        }
      }

      return originalGet(url)
    }) as typeof ApiClient.get

    ApiClient.post = (async (
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig<unknown>,
    ) => {
      const path = String(url)

      if (path === "/api/notifications/read-all") {
        notifications = notifications.map((x) => ({
          ...x,
          readAt: x.readAt ?? new Date().toISOString(),
        }))
        return { data: null }
      }

      const match = path.match(/^\/api\/notifications\/([^/]+)\/read$/)
      if (match) {
        const id = match[1]
        notifications = notifications.map((x) =>
          x.id === id ? { ...x, readAt: x.readAt ?? new Date().toISOString() } : x,
        )
        return { data: null }
      }

      return originalPost(url, data, config)
    }) as typeof ApiClient.post

    window.__DISABLE_REALTIME__ = true

    return () => {
      ApiClient.get = originalGet
      ApiClient.post = originalPost
      window.__DISABLE_REALTIME__ = false
    }
  }, [items])

  return (
    <AuthContext.Provider value={mockAuth}>
      <div className="min-h-screen bg-black p-8">
        <div className="mx-auto flex max-w-xl justify-end rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <NavigationNotifications />
        </div>
      </div>
    </AuthContext.Provider>
  )
}

const now = new Date()

const meta = {
  title: "Navigation/NavigationNotifications",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const UnreadAndRead: Story = {
  render: () => (
    <Fixture
      items={[
        {
          id: "1",
          type: "billing.payment-failed",
          title: "Payment failed",
          body: "Your coaching payment failed. Update your payment method to continue.",
          href: "/app/athlete",
          createdAt: now.toISOString(),
          readAt: null,
        },
        {
          id: "2",
          type: "invite.accepted",
          title: "Invitation accepted",
          body: "Per accepted your invitation.",
          href: "/app/coach/athletes",
          createdAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
          readAt: null,
        },
        {
          id: "3",
          type: "billing.payment-succeeded",
          title: "Athlete payment succeeded",
          body: "Athlete payment of 1000 SEK succeeded.",
          href: "/app/coach/athletes",
          createdAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
          readAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        },
      ]}
    />
  ),
}

export const Empty: Story = {
  render: () => <Fixture items={[]} />,
}

function LoadingFixture() {
  useEffect(() => {
    const originalGet = ApiClient.get.bind(ApiClient)

    ApiClient.get = (async (url: string) => {
      if (String(url).startsWith("/api/notifications")) {
        // Never resolves — keeps the component in loading state
        return new Promise(() => {})
      }
      return originalGet(url)
    }) as typeof ApiClient.get

    window.__DISABLE_REALTIME__ = true

    return () => {
      ApiClient.get = originalGet
      window.__DISABLE_REALTIME__ = false
    }
  }, [])

  return (
    <AuthContext.Provider value={mockAuth}>
      <div className="min-h-screen bg-black p-8">
        <div className="mx-auto flex max-w-xl justify-end rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <NavigationNotifications />
        </div>
      </div>
    </AuthContext.Provider>
  )
}

export const Loading: Story = {
  render: () => <LoadingFixture />,
}
