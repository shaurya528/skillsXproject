import { Router } from 'express';
import {
  listNotifications, getUnreadCount, markNotification, markManyNotifications,
} from '../controllers/notification.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
  markNotificationSchema,
  markManyNotificationsSchema,
} from '../validators/notification.validator';

const router = Router();

router.use(requireAuth);

router.get('/', validate(listNotificationsQuerySchema, 'query'), listNotifications);
router.get('/unread-count', getUnreadCount); // must be above /:notificationId
router.patch('/', validate(markManyNotificationsSchema), markManyNotifications);
router.patch(
  '/:notificationId',
  validate(notificationIdParamSchema, 'params'),
  validate(markNotificationSchema),
  markNotification
);

export default router;