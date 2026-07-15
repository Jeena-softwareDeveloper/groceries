import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';

const otpRequestSchema = z.object({ phone: z.string().min(10) });
const otpVerifySchema = z.object({ phone: z.string().min(10), otp: z.string().length(6) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const refreshSchema = z.object({ refreshToken: z.string().min(1) });

export async function customerOtpRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = otpRequestSchema.parse(req.body);
    const result = await authService.requestCustomerOtp(phone);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function customerOtpVerify(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, otp } = otpVerifySchema.parse(req.body);
    const tokens = await authService.verifyCustomerOtp(phone, otp);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

export async function vendorLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const tokens = await authService.loginVendor(email, password);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

export async function adminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const tokens = await authService.loginAdmin(email, password);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken ?? refreshSchema.parse(req.body).refreshToken;
    const tokens = await authService.refreshTokens(token);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken ?? refreshSchema.parse(req.body).refreshToken;
    await authService.logout(token);
    res.clearCookie('refreshToken');
    sendSuccess(res, { message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.sub, req.user!.role);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function switchToVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const tokens = await authService.switchToVendor(req.user!.sub);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

export async function switchToCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    // For VENDOR role, req.user!.vendorId is not in JwtPayload yet, but req.user!.sub is the vendor ID
    const tokens = await authService.switchToCustomer(req.user!.sub);
    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

