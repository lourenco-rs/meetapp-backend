import { Router } from 'express';
import multer from 'multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import AvailableController from './app/controllers/AvailableController';
import SubscriptionController from './app/controllers/SubscriptionController';

import multerConfig from './config/multer';
import requireAuth from './app/middlewares/auth';

const router = new Router();
const upload = multer(multerConfig);

router.get('/', (req, res) => {
  return res.json({ message: 'Welcome to Meetapp' });
});

router.post('/sessions', SessionController.create);
router.post('/users', UserController.create);

router.use(requireAuth);

router.put('/users', UserController.update);

router.post('/files', upload.single('file'), FileController.create);

router
  .post('/meetups', MeetupController.create)
  .put('/meetups/:id', MeetupController.update)
  .delete('/meetups/:id', MeetupController.delete)
  .get('/meetups', MeetupController.findAll)
  // .get('/meetups/organizer', MeetupController.findByOrganizer)
  .get('/available', AvailableController.findAll);

router
  .post('/subscriptions', SubscriptionController.create)
  .get('/subscriptions', SubscriptionController.findAll);

export default router;
