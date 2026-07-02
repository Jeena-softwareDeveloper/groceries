import type { Request, Response } from 'express';
import { getSignedUploadParams, isCloudinaryConfigured } from '../../lib/cloudinary.js';
import { sendError, sendSuccess } from '../../utils/response.js';

export async function getUploadSignature(req: Request, res: Response): Promise<void> {
  if (!isCloudinaryConfigured()) {
    sendError(res, 'NOT_CONFIGURED', 'Cloudinary is not configured', 503);
    return;
  }

  const folder = (req.query.folder as string) ?? 'districtmart';
  const params = await getSignedUploadParams(folder);
  sendSuccess(res, params);
}
