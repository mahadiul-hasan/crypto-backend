// controllers/notification.controller.ts
import { Request, Response } from "express";
import { notificationService } from "./notification.service";

const listNotifications = async (req: Request, res: Response) => {
  const userId = req.user.id; // assume auth middleware sets this
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const isRead =
    req.query.isRead !== undefined ? req.query.isRead === "true" : undefined;

  const data = await notificationService.listNotifications({
    userId,
    page,
    pageSize,
    isRead,
  });
  res.json(data);
};

const markNotificationRead = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const read = req.body.isRead ?? true;

  const updated = await notificationService.markNotificationRead(id, read);
  res.json(updated);
};

const deleteNotification = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await notificationService.deleteNotification(id);
  res.status(204).send();
};

export const NotificationController = {
  listNotifications,
  markNotificationRead,
  deleteNotification,
};
