import { prisma } from "../../configs/prisma";

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
};

const markNotificationRead = async (
  notificationId: string,
  read: boolean = true,
) => {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: read },
  });
};

const deleteNotification = async (notificationId: string) => {
  await prisma.notification.delete({ where: { id: notificationId } });
};

export const notificationService = {
  listNotifications,
  markNotificationRead,
  deleteNotification,
};
