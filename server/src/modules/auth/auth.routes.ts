import { Router } from 'express';
import cookieParser from 'cookie-parser';
import {
  adminLogin,
  customerOtpRequest,
  customerOtpVerify,
  logout,
  me,
  refresh,
  vendorLogin,
  switchToVendor,
  switchToCustomer,
} from './auth.controller.js';
import { authenticate, authorize } from './auth.service.js';
import { authRateLimiter, otpRateLimiter } from '../../middleware/rateLimiter.js';

export const authRoutes = Router();
authRoutes.use(cookieParser());

authRoutes.post('/customer/otp/request', otpRateLimiter, customerOtpRequest);
authRoutes.post('/customer/otp/verify', authRateLimiter, customerOtpVerify);
authRoutes.post('/vendor/login', authRateLimiter, vendorLogin);
authRoutes.post('/admin/login', authRateLimiter, adminLogin);
authRoutes.post('/refresh', authRateLimiter, refresh);
authRoutes.post('/logout', logout);
authRoutes.get('/me', authenticate, me);

authRoutes.post('/switch-to-vendor', authenticate, authorize('CUSTOMER'), switchToVendor);
authRoutes.post('/switch-to-customer', authenticate, authorize('VENDOR'), switchToCustomer);
