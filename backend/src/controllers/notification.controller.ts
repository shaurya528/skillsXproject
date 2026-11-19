import { Request, Response, NextFunction } from 'express';
import * as notificationModel from '../models/notification.model';

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = res.locals.query;
    const { data, total } = await notificationModel.listNotifications(
      req.supabase!,
      req.user!.id,
      query
    );
    res.status(200).json({ data, meta: { page: query.page, limit: query.limit, total } });
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await notificationModel.getUnreadCount(req.supabase!, req.user!.id);
    res.status(200).json({ count });
  } catch (err) {
    next(err);
  }
};

export const markNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationModel.markNotification(
      req.supabase!,
      req.user!.id,
      res.locals.params.notificationId,
      req.body.isRead
    );
    res.status(200).json(notification);
  } catch (err) {
    next(err);
  }
};

export const markManyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedCount = await notificationModel.markManyNotifications(
      req.supabase!,
      req.user!.id,
      req.body
    );
    res.status(200).json({ updatedCount });
  } catch (err) {
    next(err);
  }
};