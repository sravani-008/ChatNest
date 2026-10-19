import express from 'express';
import { googleLogin, googleCallback, devLogin, getMe, logout } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.post('/dev-login', devLogin);
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);

export default router;
