import express from 'express';
import { getUsers, getUserById } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getUsers);
router.get('/:userId', getUserById);

export default router;
