import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import requireAuth from './app/middlewares/auth';

const router = new Router();

router.get('/', (req, res) => {
  return res.json({ message: 'Welcome to Meetapp' });
});

router.post('/sessions', SessionController.create);
router.post('/users', UserController.create);

router.use(requireAuth);

router.put('/users', UserController.update);

export default router;
