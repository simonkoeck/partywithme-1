import { Router } from 'express';
import login from '../controller/auth/login';
import refresh from '../controller/auth/refresh';
import register from '../controller/auth/register';
import verify from '../controller/auth/verify';
import googleLogin from '../controller/auth/google/login';
import googleRegister from '../controller/auth/google/register';
import forgotPassword from '../controller/auth/forgot-password';
import resetPassword from '../controller/auth/reset-password';
const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refresh);
router.post('/forgot_password', forgotPassword);
router.post('/reset_password', resetPassword);
router.post('/verify', verify);

router.post('/google/login', googleLogin);
router.post('/google/register', googleRegister);

export default router;
