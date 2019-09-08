import { Router } from 'express';
import multer from 'multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';

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

export default router;
