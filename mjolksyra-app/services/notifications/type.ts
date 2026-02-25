import { z } from "zod";
import {
  notificationSchema,
  notificationsResponseSchema,
} from "./schema";

export type NotificationItem = z.infer<typeof notificationSchema>;
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;
