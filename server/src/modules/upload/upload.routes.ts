import { Router } from 'express';
import { getUploadSignature } from './upload.controller.js';

export const uploadRoutes = Router();

uploadRoutes.get('/signature', getUploadSignature);
