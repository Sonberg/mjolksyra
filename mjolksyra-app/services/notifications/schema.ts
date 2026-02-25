import { z } from "zod";

export const notificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string().nullable().optional().default(null),
  href: z.string().nullable().optional().default(null),
  createdAt: z.coerce.date(),
  readAt: z.coerce.date().nullable().optional().default(null),
});

export const notificationsResponseSchema = z.object({
  unreadCount: z.number(),
  items: z.array(notificationSchema),
});
