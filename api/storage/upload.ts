import cloudinaryUploadHandler from '../cloudinary-upload';

/**
 * Compatibility wrapper for /api/storage/upload
 * Routes all image storage uploads through the secure Cloudinary handler.
 */
export default async function handler(req: any, res: any) {
  return cloudinaryUploadHandler(req, res);
}
