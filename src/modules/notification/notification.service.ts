import { prisma } from "../../configs/prisma";
import {
  cacheGetOrSet,
  cacheInvalidate,
  makeCacheKey,
} from "../../utils/cache";

type ListNotificationsParams = {
  userId: string;
  page: number;
  pageSize: number;
  isRead?: boolean;
};

const listNotifications = async ({
  userId,
  page,
  pageSize,
  isRead,
}: ListNotificationsParams) => {
  const readFlag = typeof isRead === "boolean" ? isRead.toString() : "all";
  const key = makeCacheKey(
    "notifications:list",
    `${userId}:${page}:${pageSize}:${readFlag}`,
  );

  return cacheGetOrSet(key, async () => {
    const where: any = { userId };
    if (typeof isRead === "boolean") where.isRead = isRead;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
    ]);

    return { data: notifications, total, page, pageSize };
  });
};

const markNotificationRead = async (
  notificationId: string,
  read: boolean = true,
) => {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: read },
  });

  // Invalidate cache for this user
  await cacheInvalidate(`notifications:list:${notification.userId}:*`);

  return notification;
};

const deleteNotification = async (notificationId: string) => {
  // Find notification first to get userId for cache invalidation
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) throw new Error("Notification not found");

  await prisma.notification.delete({ where: { id: notificationId } });

  // Invalidate cache for this user
  await cacheInvalidate(`notifications:list:${notification.userId}:*`);
};

export const notificationService = {
  listNotifications,
  markNotificationRead,
  deleteNotification,
};
